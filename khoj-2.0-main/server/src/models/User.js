const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    /** Google "sub" — present when the account can sign in with Google */
    googleSub: { type: String, select: false, sparse: true, unique: true },
    phone: { type: String, default: '' },

    // ── University / Campus (optional until onboarding completes) ──
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      default: null,
      index: true,
    },
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    universityName: { type: String, default: '' },
    campusName: { type: String, default: '' },

    reputation: { type: Number, default: 0 },

    isEmailVerified: { type: Boolean, default: false, index: true },
    emailOtp: { type: String, select: false },
    emailOtpExpiry: { type: Date, select: false },
    emailOtpAttempts: { type: Number, default: 0, select: false },

    tokenVersion: { type: Number, default: 0, select: false },
    refreshTokenHash: { type: String, select: false },

    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, universityId: 1 });
userSchema.index({ universityId: 1, campusId: 1 });

userSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

const MAX_LOGIN_ATTEMPTS = 10;
const LOCK_DURATION_MS = 30 * 60 * 1000;

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
