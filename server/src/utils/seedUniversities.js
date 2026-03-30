const University = require('../models/University');

const universities = [
  {
    name: 'PES University',
    slug: 'pes-university',
    campuses: [{ name: 'Ring Road Campus' }, { name: 'Electronic City Campus' }, { name: 'Hanumantha Nagar Campus' }],
  },
  {
    name: 'RV College of Engineering',
    slug: 'rvce',
    campuses: [{ name: 'Main Campus (Mysore Road)' }],
  },
  {
    name: 'MS Ramaiah Institute of Technology',
    slug: 'msrit',
    campuses: [{ name: 'Main Campus (MSR Nagar)' }],
  },
  {
    name: 'BMS College of Engineering',
    slug: 'bmsce',
    campuses: [{ name: 'Main Campus (Bull Temple Road)' }],
  },
  {
    name: 'Dayananda Sagar Institutions',
    slug: 'dayananda-sagar',
    campuses: [
      { name: 'DSU Campus (Harohalli)' },
      { name: 'DSCE Campus (Shavige Malleshwara Hills)' },
      { name: 'DSATM Campus (Kanakapura Road)' },
    ],
  },
  {
    name: 'REVA University',
    slug: 'reva-university',
    campuses: [{ name: 'Main Campus (Yelahanka)' }, { name: 'Rukmini Knowledge Park' }],
  },
  {
    name: 'Christ University',
    slug: 'christ-university',
    campuses: [
      { name: 'Central Campus (Hosur Road)' },
      { name: 'Kengeri Campus' },
      { name: 'Bannerghatta Road Campus' },
      { name: 'Yeshwanthpur Campus' },
    ],
  },
  {
    name: 'Jain University',
    slug: 'jain-university',
    campuses: [
      { name: 'City Campus (JC Road)' },
      { name: 'Jayanagar Campus' },
      { name: 'Kanakapura Road Campus' },
    ],
  },
  {
    name: 'UVCE',
    slug: 'uvce',
    campuses: [{ name: 'Main Campus (KR Circle)' }],
  },
  {
    name: 'Bangalore University',
    slug: 'bangalore-university',
    campuses: [{ name: 'Jnanabharathi Campus' }, { name: 'Central College Campus' }],
  },
];

const seedUniversities = async () => {
  for (const u of universities) {
    const existing = await University.findOne({ slug: u.slug }).lean();

    const campusesPayload = (() => {
      if (!existing) {
        return u.campuses.map((c) => ({ name: c.name }));
      }
      const oldByLower = new Map(
        (existing.campuses || []).map((c) => [String(c.name).toLowerCase(), c])
      );
      return u.campuses.map((c) => {
        const prev = oldByLower.get(String(c.name).toLowerCase());
        if (prev && prev._id) {
          return { _id: prev._id, name: c.name };
        }
        return { name: c.name };
      });
    })();

    await University.findOneAndUpdate(
      { slug: u.slug },
      {
        $set: {
          name: u.name,
          slug: u.slug,
          campuses: campusesPayload,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // Ensure we have EXACTLY the 10 universities in this dataset.
  const allowedSlugs = universities.map((u) => u.slug);
  await University.deleteMany({ slug: { $nin: allowedSlugs } });

  console.log(`Universities synced (${universities.length} slugs, upserted)`);
};

module.exports = seedUniversities;
