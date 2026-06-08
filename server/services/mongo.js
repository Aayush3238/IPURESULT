import { MongoClient } from "mongodb";

let clientPromise;

export function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export async function getMongoClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!clientPromise) {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 15000),
      connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || 15000),
    });
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getInternalsCollection() {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB_NAME || "ipuresults";
  const collectionName = process.env.MONGODB_INTERNALS_COLLECTION || "ipuinternals";

  return client.db(dbName).collection(collectionName);
}
