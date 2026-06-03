import pkg from 'mongodb';
import { EJSON } from 'bson';
const { MongoClient } = pkg;
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tradenix_venture';
const outDir = path.join(root, 'deploy', 'mongo-dump');

mkdirSync(outDir, { recursive: true });

const client = new MongoClient(uri);
await client.connect();
const db = client.db();
const collections = await db.listCollections().toArray();

for (const { name } of collections) {
  const docs = await db.collection(name).find({}).toArray();
  writeFileSync(path.join(outDir, `${name}.json`), EJSON.stringify(docs));
  console.log(`${name}: ${docs.length} documents`);
}

await client.close();
console.log('Export complete:', outDir);
