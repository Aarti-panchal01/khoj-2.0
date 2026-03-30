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

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String },
    userPhone: { type: String },

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
  },
  { timestamps: true }
);

itemSchema.index({ universityId: 1, createdAt: -1 });
itemSchema.index({ universityId: 1, type: 1, status: 1 });
itemSchema.index({ universityId: 1, category: 1 });
itemSchema.index({ universityId: 1, campusId: 1, createdAt: -1 });

itemSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  category: 'text',
});

module.exports = mongoose.model('Item', itemSchema);
