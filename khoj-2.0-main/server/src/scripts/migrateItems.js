import mongoose from "mongoose";
import dotenv from "dotenv";

import Item from "../models/Item.js";
import University from "../models/University.js";

dotenv.config();

const rawMongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!rawMongoUri) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}

// Guard against malformed URI writeConcern (e.g., w=majorit) without editing env files.
const MONGO_URI = rawMongoUri.replace(/([?&]w=)majorit(\b)/i, "$1majority$2");
const VALID_REWARDS = new Set(["gratitude", "food_treat", "coffee", "cash_reward", "gift", "none"]);

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI, { writeConcern: { w: "majority" } });
    console.log("Connected to DB");

    const items = await Item.find({
      $or: [{ universityId: { $exists: false } }, { universityId: null }],
    });

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
        name: item.college,
      });

      if (!university) {
        console.log("No university match for:", item.college);
        skipped++;
        continue;
      }

      item.universityId = university._id;

      if (item.campus) {
        const campus = university.campuses.find((c) => c.name === item.campus);

        if (campus) {
          item.campusId = campus._id;
        } else {
          console.log("No university match for:", item.college);
        }
      }

      // Ensure required location field is populated for validation
      if (!item.location || typeof item.location !== "string" || item.location.trim() === "") {
        item.location = "Unknown location";
      }

      // Normalize legacy reward values to pass current enum validation
      if (item.reward === "cash") {
        item.reward = "cash_reward";
      } else if (item.reward && !VALID_REWARDS.has(item.reward)) {
        item.reward = "none";
      }

      await item.save();
      updated++;
    }

    console.log("Migration complete");
    console.log({ updated, skipped });

    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
