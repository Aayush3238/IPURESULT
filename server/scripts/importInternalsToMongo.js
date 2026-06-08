import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getInternalsCollection, getMongoClient } from "../services/mongo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "internals.json");

async function importInternalsToMongo() {
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Internals JSON not found at ${dataPath}`);
  }

  const raw = fs.readFileSync(dataPath, "utf-8");
  const students = JSON.parse(raw);

  if (!Array.isArray(students) || students.length === 0) {
    throw new Error("Internals JSON does not contain any students.");
  }

  const uniqueStudents = Array.from(
    students
      .filter((student) => student?.enrollment)
      .reduce((map, student) => map.set(student.enrollment, student), new Map())
      .values()
  );

  console.log(
    `Loaded ${students.length} rows from ${dataPath}; ${uniqueStudents.length} unique enrollments will be imported.`
  );
  console.log("Connecting to MongoDB...");
  const collection = await getInternalsCollection();
  console.log("Connected. Creating enrollment index...");
  await collection.createIndex({ enrollment: 1 }, { unique: true });
  console.log("Index ready. Starting import...");

  const batchSize = Number(process.env.MONGODB_IMPORT_BATCH_SIZE || 500);
  const importMode = process.env.MONGODB_IMPORT_MODE || "upsert";
  let matchedCount = 0;
  let modifiedCount = 0;
  let upsertedCount = 0;
  let insertedCount = 0;

  if (importMode === "replace") {
    console.log("Replace mode enabled. Clearing existing internal marks collection...");
    await collection.deleteMany({});

    for (let index = 0; index < uniqueStudents.length; index += batchSize) {
      const now = new Date();
      const batch = uniqueStudents.slice(index, index + batchSize).map((student) => ({
        enrollment: student.enrollment,
        name: student.name,
        subjects: student.subjects || [],
        createdAt: now,
        updatedAt: now,
      }));

      const result = await collection.insertMany(batch, { ordered: false });
      insertedCount += result.insertedCount;
      console.log(`Imported ${Math.min(index + batch.length, uniqueStudents.length)} / ${uniqueStudents.length}`);
    }

    console.log(
      `Imported ${uniqueStudents.length} students into ${process.env.MONGODB_DB_NAME || "ipuresults"}.${
        process.env.MONGODB_INTERNALS_COLLECTION || "ipuinternals"
      }`
    );
    console.log(`Inserted: ${insertedCount}`);
    return;
  }

  for (let index = 0; index < uniqueStudents.length; index += batchSize) {
    const batch = uniqueStudents.slice(index, index + batchSize);
    const now = new Date();
    const operations = batch.map((student) => ({
      updateOne: {
        filter: { enrollment: student.enrollment },
        update: {
          $set: {
            enrollment: student.enrollment,
            name: student.name,
            subjects: student.subjects || [],
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations, { ordered: false });
    matchedCount += result.matchedCount;
    modifiedCount += result.modifiedCount;
    upsertedCount += result.upsertedCount;
    console.log(`Imported ${Math.min(index + batch.length, uniqueStudents.length)} / ${uniqueStudents.length}`);
  }

  console.log(
    `Imported ${uniqueStudents.length} students into ${process.env.MONGODB_DB_NAME || "ipuresults"}.${
      process.env.MONGODB_INTERNALS_COLLECTION || "ipuinternals"
    }`
  );
  console.log(
    `Matched: ${matchedCount}, inserted: ${upsertedCount}, modified: ${modifiedCount}`
  );
}

importInternalsToMongo()
  .catch((error) => {
    console.error("Failed to import internals:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const client = await getMongoClient().catch(() => null);
    await client?.close();
  });
