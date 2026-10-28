import { MongoClient } from "mongodb";

const globalMongo = globalThis as typeof globalThis & {
  wanbizMongoClientPromise?: Promise<MongoClient>;
};

function getMongoClient(): Promise<MongoClient> {
  const uri = process.env["MONGODB_URI"];
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  if (!globalMongo.wanbizMongoClientPromise) {
    const client = new MongoClient(uri);
    globalMongo.wanbizMongoClientPromise = client.connect().catch((error: unknown) => {
      globalMongo.wanbizMongoClientPromise = undefined;
      throw error;
    });
  }

  return globalMongo.wanbizMongoClientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();
  const databaseName = process.env["MONGODB_DB"];
  return databaseName ? client.db(databaseName) : client.db();
}
