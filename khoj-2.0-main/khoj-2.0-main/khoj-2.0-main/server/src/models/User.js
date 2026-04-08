const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, required: true },

    // ── University / Campus (ObjectId refs — source of truth for access control) ──
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
      index: true,
    },
    campusId: {
      type: mongoose.Schema.Types.ObjectId, // references University.campuses._id
      default: null,
      index: true,
    },

    // ── Display cache — denormalised for fast reads, never used for access control ──
    universityName: { type: String, required: true },
    campusName: { type: String, default: '' },

    reputation: { type: Number, default: 0 },

    // ── Email verification ────────────────────────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false, index: true },
    emailOtp: { type: String, select: false },
    emailOtpExpiry: { type: Date, select: false },
    emailOtpAttempts: { type: Number, default: 0, select: false },

    // ── Token versioning ──────────────────────────────────────────────────────────
    tokenVersion: { type: Number, default: 0, select: false },
    refreshTokenHash: { type: String, select: false },

    // ── Account lockout ───────────────────────────────────────────────────────────
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, universityId: 1 });
userSchema.index({ universityId: 1, campusId: 1 });

// Returns true if account is currently locked
userSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

const MAX_LOGIN_ATTEMPTS = 10;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

userSchema.methods.incLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const update = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    update.$set = { lockUntil: new Date(Date.now() + LOCK_DURATION_MS) };
  }
  return this.updateOne(update);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
};

module.exports = mongoose.model('User', userSchema);
