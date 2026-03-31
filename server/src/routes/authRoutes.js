const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const University = require('../models/University');
const {
  signupSchema,
  loginSchema,
  authProfilePatchSchema,
  googleAuthSchema,
} = require('../utils/validators');
const { generateOtp, sendVerificationEmail } = require('../utils/email');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Token helpers ────────────────────────────────────────────────────────────

const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_COOKIE_NAME = 'khoj_refresh';

const COOKIE_OPTS = {
  httpOnly: true,
  // In production (Vercel ↔ Render cross-domain): secure + sameSite none required
  // In development: insecure cookies work fine on localhost
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

const createAccessToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      universityId: user.universityId,
      campusId: user.campusId || null,
      tv: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

const createRefreshToken = (user) =>
  jwt.sign(
    { id: user._id, tv: user.tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? '',
  universityId: user.universityId || null,
  campusId: user.campusId || null,
  universityName: user.universityName || '',
  campusName: user.campusName || '',
  reputation: user.reputation,
  isEmailVerified: user.isEmailVerified,
});

// ─── Helper: resolve university + campus names → ObjectIds ───────────────────

/**
 * Looks up a university by name (case-insensitive) and optionally a campus by name.
 * Returns { university, campus } or throws a user-facing error.
 */
const resolveCampusForUniversityDoc = (university, campusIdInput) => {
  if (!university?.campuses?.length) {
    const err = new Error('University has no campuses configured.');
    err.status = 400;
    throw err;
  }

  if (university.campuses.length === 1) {
    return university.campuses[0];
  }

  if (!campusIdInput || !String(campusIdInput).trim()) {
    const err = new Error('Campus is required for this university.');
    err.status = 400;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(campusIdInput)) {
    const err = new Error('Invalid campusId');
    err.status = 400;
    throw err;
  }

  const campus = university.campuses.id(campusIdInput);
  if (!campus) {
    const err = new Error('Campus does not belong to this university.');
    err.status = 400;
    throw err;
  }
  return campus;
};

const resolveUniversityAndCampus = async (universityName, campusName) => {
  const university = await University.findOne({
    name: { $regex: new RegExp(`^${universityName.trim()}$`, 'i') },
  });

  if (!university) {
    const err = new Error('University not found. Please select from the list.');
    err.status = 400;
    throw err;
  }

  let campus = null;
  if (campusName && campusName.trim()) {
    campus = university.campuses.find(
      (c) => c.name.toLowerCase() === campusName.trim().toLowerCase()
    );
    if (!campus && university.campuses.length > 0) {
      const err = new Error('Campus not found for this university. Please select from the list.');
      err.status = 400;
      throw err;
    }
  } else if (university.campuses.length === 1) {
    // Auto-assign if only one campus exists
    campus = university.campuses[0];
  }

  return { university, campus };
};

// ─── Signup ───────────────────────────────────────────────────────────────────

router.post('/signup', async (req, res) => {
  try {
    const payload = signupSchema.parse(req.body);

    const existing = await User.findOne({ email: payload.email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 8);
    const passwordHash = await bcrypt.hash(payload.password, 10);
    const provisionalName = payload.email.split('@')[0]?.trim() || 'Student';

    const user = await User.create({
      name: provisionalName.slice(0, 100),
      email: payload.email,
      passwordHash,
      phone: '',
      universityId: null,
      campusId: null,
      universityName: '',
      campusName: '',
      isEmailVerified: false,
      emailOtp: otpHash,
      emailOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      emailOtpAttempts: 0,
    });

    // Send the verification OTP. If it fails, don't leave a half-configured account.
    try {
      await sendVerificationEmail(user.email, otp, user.name);
    } catch (err) {
      console.error('Signup email OTP send failed:', err?.message || err);
      await User.findByIdAndDelete(user._id);
      const status = err?.status || 503;
      const message = err?.publicMessage || 'Failed to send verification email';
      return res.status(status).json({ message });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await User.findByIdAndUpdate(user._id, { refreshTokenHash: hashToken(refreshToken) });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTS);
    return res.status(201).json({
      message: 'Account created successfully.',
      token: accessToken,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Signup error:', error.name);
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const field = firstError.path.join('.');
      return res.status(400).json({ message: `${field}: ${firstError.message}`, field, errors: error.errors });
    }
    return res.status(500).json({ message: 'Failed to create account' });
  }
});

// ─── Verify Email ─────────────────────────────────────────────────────────────

router.post('/verify-email', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ message: 'userId and otp are required' });
    }

    const user = await User.findById(userId)
      .select('+emailOtp +emailOtpExpiry +emailOtpAttempts +tokenVersion +refreshTokenHash');

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

    if (!user.emailOtp || !user.emailOtpExpiry || user.emailOtpExpiry < Date.now()) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }

    const MAX_OTP_ATTEMPTS = 5;
    if (user.emailOtpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many attempts. Please request a new code.' });
    }

    const otpMatch = await bcrypt.compare(String(otp).trim(), user.emailOtp);
    if (!otpMatch) {
      await User.findByIdAndUpdate(user._id, { $inc: { emailOtpAttempts: 1 } });
      const attemptsLeft = MAX_OTP_ATTEMPTS - (user.emailOtpAttempts + 1);
      return res.status(400).json({
        message: attemptsLeft > 0
          ? `Invalid code. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`
          : 'Too many attempts. Please request a new code.',
      });
    }

    const refreshToken = createRefreshToken(user);
    const refreshHash = hashToken(refreshToken);

    await User.findByIdAndUpdate(user._id, {
      isEmailVerified: true,
      $unset: { emailOtp: 1, emailOtpExpiry: 1 },
      refreshTokenHash: refreshHash,
    });

    const accessToken = createAccessToken(user);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTS);
    return res.json({
      token: accessToken,
      user: { ...formatUser(user), isEmailVerified: true },
    });
  } catch (error) {
    console.error('Verify email error:', error.name);
    return res.status(500).json({ message: 'Verification failed' });
  }
});

// ─── Resend OTP ───────────────────────────────────────────────────────────────

router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const user = await User.findById(userId).select('+emailOtpExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

    // Cooldown: block resend if the previous OTP was generated very recently.
    // Previously ~60s; slightly relaxed to ~45s.
    if (user.emailOtpExpiry && user.emailOtpExpiry > Date.now() + 9.25 * 60 * 1000) {
      return res.status(429).json({ message: 'Please wait before requesting a new code' });
    }

    console.log('[OTP_DEBUG] resend-otp generating OTP', {
      userId: String(user._id),
      email: user.email,
    });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 8);

    await User.findByIdAndUpdate(user._id, {
      emailOtp: otpHash,
      emailOtpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      emailOtpAttempts: 0,
    });

    try {
      console.log('[OTP_DEBUG] resend-otp sending verification email', {
        userId: String(user._id),
        email: user.email,
      });
      await sendVerificationEmail(user.email, otp, user.name);
    } catch (err) {
      console.error('[OTP_DEBUG] resend-otp sendVerificationEmail failed', {
        userId: String(user._id),
        message: err?.message || err,
      });
      const status = err?.status || 500;
      const message = err?.publicMessage || 'Failed to send verification email';
      return res.status(status).json({ message });
    }

    return res.json({ message: 'New verification code sent' });
  } catch (error) {
    console.error('Resend OTP error:', error?.name, error?.message);
    return res.status(500).json({ message: 'Failed to resend code' });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const payload = loginSchema.parse(req.body);

    const user = await User.findOne({ email: payload.email })
      .select('+passwordHash +tokenVersion +loginAttempts +lockUntil +refreshTokenHash');

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Account temporarily locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`,
      });
    }

    const passwordMatch = await bcrypt.compare(payload.password, user.passwordHash);
    if (!passwordMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await user.resetLoginAttempts();

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await User.findByIdAndUpdate(user._id, { refreshTokenHash: hashToken(refreshToken) });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTS);
    return res.json({ token: accessToken, user: formatUser(user) });
  } catch (error) {
    console.error('Login error:', error.name);
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      const field = firstError.path.join('.');
      return res.status(400).json({ message: `${field}: ${firstError.message}`, field, errors: error.errors });
    }
    return res.status(500).json({ message: 'Failed to login' });
  }
});

// ─── Refresh Token ────────────────────────────────────────────────────────────

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      res.clearCookie(REFRESH_COOKIE_NAME, { ...COOKIE_OPTS, maxAge: 0 });
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id).select('+tokenVersion +refreshTokenHash');
    if (!user) return res.status(401).json({ message: 'User not found' });

    if (decoded.tv !== user.tokenVersion) {
      res.clearCookie(REFRESH_COOKIE_NAME, { ...COOKIE_OPTS, maxAge: 0 });
      return res.status(401).json({ message: 'Session invalidated. Please log in again.' });
    }

    const incomingHash = hashToken(token);
    if (incomingHash !== user.refreshTokenHash) {
      await User.findByIdAndUpdate(user._id, { $inc: { tokenVersion: 1 }, $unset: { refreshTokenHash: 1 } });
      res.clearCookie(REFRESH_COOKIE_NAME, { ...COOKIE_OPTS, maxAge: 0 });
      return res.status(401).json({ message: 'Token reuse detected. Please log in again.' });
    }

    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    await User.findByIdAndUpdate(user._id, { refreshTokenHash: hashToken(newRefreshToken) });

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, COOKIE_OPTS);
    return res.json({ token: newAccessToken });
  } catch (error) {
    console.error('Refresh error:', error.name);
    return res.status(500).json({ message: 'Failed to refresh session' });
  }
});

// ─── Logout ───────────────────────────────────────────────────────────────────

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { tokenVersion: 1 },
      $unset: { refreshTokenHash: 1 },
    });
    res.clearCookie(REFRESH_COOKIE_NAME, { ...COOKIE_OPTS, maxAge: 0 });
    return res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error.name);
    return res.status(500).json({ message: 'Failed to logout' });
  }
});

// ─── Me ───────────────────────────────────────────────────────────────────────

router.get('/me', authMiddleware, async (req, res) => {
  return res.json(formatUser(req.user));
});

// ─── Google OAuth (ID token from Google Identity Services) ───────────────────

router.post('/google', async (req, res) => {
  try {
    const payload = googleAuthSchema.parse(req.body);
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({ message: 'Google sign-in is not configured on this server.' });
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: payload.credential,
      audience: clientId,
    });
    const g = ticket.getPayload();
    if (!g?.email) {
      return res.status(400).json({ message: 'Google did not return an email address.' });
    }

    const email = String(g.email).toLowerCase();
    let user = await User.findOne({ email }).select('+googleSub +tokenVersion +refreshTokenHash');

    if (!user) {
      const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      user = await User.create({
        name: (g.name && g.name.trim()) || email.split('@')[0] || 'Student',
        email,
        passwordHash,
        googleSub: g.sub,
        phone: '',
        universityId: null,
        campusId: null,
        universityName: '',
        campusName: '',
        isEmailVerified: Boolean(g.email_verified),
      });
    } else {
      if (!user.googleSub && g.sub) {
        user.googleSub = g.sub;
        await user.save();
      }
    }

    user = await User.findById(user._id);
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await User.findByIdAndUpdate(user._id, { refreshTokenHash: hashToken(refreshToken) });
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, COOKIE_OPTS);
    return res.json({ token: accessToken, user: formatUser(user) });
  } catch (error) {
    console.error('Google auth error:', error.name || error.message);
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      return res.status(400).json({ message: `${firstError.path.join('.')}: ${firstError.message}` });
    }
    return res.status(401).json({ message: 'Google sign-in failed' });
  }
});

// ─── Complete onboarding / profile (university + campus) ───────────────────

router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    if (req.user.universityId) {
      return res.status(400).json({ message: 'Profile already has a university. Contact support to change it.' });
    }

    const body = authProfilePatchSchema.parse(req.body);

    if (!mongoose.Types.ObjectId.isValid(body.universityId)) {
      return res.status(400).json({ message: 'Invalid universityId' });
    }

    const university = await University.findById(body.universityId);
    if (!university) {
      return res.status(400).json({ message: 'University not found' });
    }

    let campus;
    try {
      campus = resolveCampusForUniversityDoc(university, body.campusId);
    } catch (err) {
      return res.status(err.status || 400).json({ message: err.message });
    }

    const updateDoc = {
      name: body.name.trim(),
      universityId: university._id,
      universityName: university.name,
      campusId: campus?._id || null,
      campusName: campus?.name || '',
    };

    if (body.phone) {
      updateDoc.phone = body.phone.trim();
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updateDoc, { new: true });

    return res.json(formatUser(updated));
  } catch (error) {
    console.error('PATCH profile error:', error.name);
    if (error.name === 'ZodError') {
      const firstError = error.errors[0];
      return res.status(400).json({ message: `${firstError.path.join('.')}: ${firstError.message}` });
    }
    return res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;
