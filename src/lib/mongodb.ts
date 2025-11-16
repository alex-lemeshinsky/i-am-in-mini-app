import { Collection, Document, MongoClient, MongoClientOptions } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "i-am-in";

type GlobalMongo = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as GlobalMongo;

export const mongoEnabled = Boolean(MONGODB_URI);

async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!globalForMongo._mongoClientPromise) {
    const options: MongoClientOptions = {};

    // Allow opting into insecure TLS for local/self-signed clusters
    if (process.env.MONGODB_TLS_ALLOW_INVALID_CERTS === "true") {
      options.tlsAllowInvalidCertificates = true;
    }

    const client = new MongoClient(MONGODB_URI, options);
    globalForMongo._mongoClientPromise = client.connect();
  }

  return globalForMongo._mongoClientPromise;
}

export async function getMongoCollection<TSchema extends Document = Document>(
  collectionName: string
): Promise<Collection<TSchema>> {
  const client = await getMongoClient();
  return client.db(DB_NAME).collection<TSchema>(collectionName);
}
