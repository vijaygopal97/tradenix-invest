import pkg from 'mongodb';
import { EJSON } from 'bson';
const { MongoClient } = pkg;
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tradenix_venture';
const inDir = path.join(root, 'deploy', 'mongo-dump');

const client = new MongoClient(uri);
await client.connect();
const db = client.db();

for (const file of readdirSync(inDir).filter((f) => f.endsWith('.json'))) {
  const name = file.replace(/\.json$/, '');
  const raw = readFileSync(path.join(inDir, file), 'utf8');
  const docs = EJSON.parse(raw);
  if (!docs.length) {
    console.log(`${name}: empty, skip`);
    continue;
  }
  await db.collection(name).deleteMany({});
  await db.collection(name).insertMany(docs);
  console.log(`${name}: ${docs.length} documents imported`);
}

await client.close();
console.log('Import complete');
