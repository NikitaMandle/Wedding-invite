require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 7000,
    family: 4
  });

  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'wedding_invite');
  const src = db.collection('gallery_access');
  const dst = db.collection('access_gallery');
  const numbers = ['9322188758', '7558741500'];

  for (const n of numbers) {
    const doc = (await src.findOne({ mobileNo: n })) || { mobileNo: n, active: true };
    const next = { ...doc, mobileNo: n, active: true, updatedAt: new Date() };
    if (!next.createdAt) next.createdAt = new Date();
    await dst.updateOne({ mobileNo: n }, { $set: next }, { upsert: true });
  }

  const out = await dst
    .find({ mobileNo: { $in: numbers } }, { projection: { _id: 0, mobileNo: 1, active: 1 } })
    .toArray();

  console.log(JSON.stringify(out));
  await client.close();
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
