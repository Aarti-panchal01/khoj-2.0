const mongoose = require('mongoose');

// Each campus is a sub-document with its own _id so it can be referenced by ObjectId
const campusSchema = new mongoose.Schema({
  name: { type: String, required: true },
}, { _id: true });

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    campuses: [campusSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('University', universitySchema);
