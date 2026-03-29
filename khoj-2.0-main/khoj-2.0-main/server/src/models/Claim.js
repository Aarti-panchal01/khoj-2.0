const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    claimerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    whereList: {
      type: String,
      default: '',
    },
    whenList: {
      type: String,
      default: '',
    },
    specificDetails: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for common queries
claimSchema.index({ itemId: 1, status: 1 });
claimSchema.index({ ownerId: 1, status: 1 });
claimSchema.index({ claimerId: 1, status: 1 });

module.exports = mongoose.model('Claim', claimSchema);
