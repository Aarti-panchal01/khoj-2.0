import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Item from '../models/Item.js';
import University from '../models/University.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
console.error('Missing MONGO_URI in .env');
process.exit(1);
}

async function migrate() {
try {
await mongoose.connect(MONGO_URI);
console.log('✅ Connected to DB');

```
const items = await Item.find();

let updated = 0;
let skipped = 0;

for (const item of items) {
  // skip if already migrated
  if (item.universityId && item.campusId) continue;

  if (!item.college) {
    skipped++;
    continue;
  }

  const university = await University.findOne({
    name: item.college
  });

  if (!university) {
    console.log(`⚠️ No university match for: ${item.college}`);
    skipped++;
    continue;
  }

  item.universityId = university._id;

  if (item.campus) {
    const campus = university.campuses.find(
      c => c.name === item.campus
    );

    if (campus) {
      item.campusId = campus._id;
    } else {
      console.log(`⚠️ No campus match for: ${item.campus}`);
    }
  }

  await item.save();
  updated++;
}

console.log('🎯 Migration complete');
console.log({ updated, skipped });

process.exit(0);
```

} catch (err) {
console.error('❌ Migration failed:', err);
process.exit(1);
}
}

migrate();
