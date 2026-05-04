import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

const DEFAULT_DEV_URI = 'mongodb://127.0.0.1:27017/poidsbaoule';

export async function getDb(): Promise<Db> {
  if (db) return db;
  const isProd = process.env.NODE_ENV === 'production';
  const fromEnv =
    process.env.MONGODB_URI?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.MONGODB_URL?.trim();
  const uri = fromEnv || (!isProd ? DEFAULT_DEV_URI : '');
  if (!uri) {
    throw new Error(
      'MONGODB_URI, DATABASE_URL ou MONGODB_URL est requis en production. Voir .env.example.'
    );
  }
  if (!fromEnv && !isProd) {
    console.warn(
      `[mongo] MONGODB_URI / DATABASE_URL absents — URI locale par défaut : ${DEFAULT_DEV_URI}`
    );
  }
  client = new MongoClient(uri);
  await client.connect();
  const name = process.env.MONGODB_DB_NAME || 'poidsbaoule';
  db = client.db(name);
  return db;
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
