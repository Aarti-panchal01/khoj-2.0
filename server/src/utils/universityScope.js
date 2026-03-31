const mongoose = require('mongoose');
const University = require('../models/University');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Mongo filter matching items in the user's institution during legacy → ObjectId migration.
 * Matches new documents (universityId) or legacy rows where `college` equals universityName.
 */
function universityMatchFilter(user) {
  if (!user) return {};
  const or = [];
  if (user.universityId) {
    or.push({ universityId: user.universityId });
  }
  const name = user.universityName && String(user.universityName).trim();
  if (name) {
    or.push({ college: name });
    or.push({ college: new RegExp(`^${escapeRegex(name)}$`, 'i') });
  }
  return or.length ? { $or: or } : {};
}

/**
 * Resolve campus display name for filtering legacy `item.campus` strings by ObjectId.
 */
async function getCampusNameByCampusId(campusId) {
  if (!campusId || !mongoose.Types.ObjectId.isValid(campusId)) return null;
  const oid = new mongoose.Types.ObjectId(campusId);
  const uni = await University.findOne({ 'campuses._id': oid }).select('campuses').lean();
  if (!uni?.campuses?.length) return null;
  const c = uni.campuses.find((x) => String(x._id) === String(campusId));
  return c?.name ? String(c.name).trim() : null;
}

module.exports = { escapeRegex, universityMatchFilter, getCampusNameByCampusId };
