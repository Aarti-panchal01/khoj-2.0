const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['found', 'lost'], required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    images: [{ type: String }],
    urgent: { type: Boolean, default: false },
    reward: { type: String, enum: ['gratitude', 'food_treat', 'coffee', 'cash_reward', 'gift', 'none'], default: 'none' },
    contactPreference: { type: String, enum: ['both', 'email', 'phone'], default: 'both' },
    status: { type: String, enum: ['active', 'resolved'], default: 'active', index: true },

    // ── Ownership ─────────────────────────────────────────────────────────────────
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    // Contact info is NOT stored here — fetched via User join on demand (owner only)

    // ── University / Campus (ObjectId refs — used for ALL access control queries) ─
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
      index: true,
    },
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    // ── Display cache — for rendering only, never used in access control ──────────
    universityName: { type: String, required: true },
    campusName: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound indexes for the primary query pattern: university-wide feed
itemSchema.index({ universityId: 1, createdAt: -1 });
itemSchema.index({ universityId: 1, type: 1, status: 1 });
itemSchema.index({ universityId: 1, category: 1 });
// Campus filter index — used when ?campusId= is provided
itemSchema.index({ universityId: 1, campusId: 1, createdAt: -1 });

// Text index for search
itemSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  category: 'text',
});

module.exports = mongoose.model('Item', itemSchema);
