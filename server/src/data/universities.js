/**
 * Seed data for universities and their campuses.
 * To add a new university: append an entry here and restart the server.
 * No code changes required — fully DB-driven.
 */
module.exports = [
  {
    name: 'PES University',
    slug: 'pes-university',
    campuses: [
      { name: 'Electronic City Campus' },
      { name: 'Ring Road Campus' },
      { name: 'Hanumanth Nagar Campus' },
    ],
  },
  {
    name: 'Dayananda Sagar University',
    slug: 'dayananda-sagar-university',
    campuses: [
      { name: 'Main Campus' },
    ],
  },
  {
    name: 'RV College of Engineering',
    slug: 'rv-college-of-engineering',
    campuses: [
      { name: 'Main Campus' },
    ],
  },
  {
    name: 'REVA University',
    slug: 'reva-university',
    campuses: [
      { name: 'Main Campus' },
    ],
  },
  {
    name: 'UVCE',
    slug: 'uvce',
    campuses: [
      { name: 'Main Campus' },
    ],
  },
];
