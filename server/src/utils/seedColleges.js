const College = require('../models/College');
const colleges = require('../data/colleges');

const toSlug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const seedColleges = async () => {
  const count = await College.countDocuments();
  if (count > 0) {
    return;
  }

  await College.insertMany(
    colleges.map((college) => ({
      ...college,
      slug: toSlug(college.name),
    }))
  );

  console.log('Seeded default colleges');
};

module.exports = seedColleges;
