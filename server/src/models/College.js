const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    campuses: [{ type: String }],
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('College', collegeSchema);
