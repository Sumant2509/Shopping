const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = process.env.MONGODB_URI || 'mongodb+srv://sumant:Ram2509%40@cluster0.yo1ya6l.mongodb.net/sumant_crafts?retryWrites=true&w=majority';
const dbName = process.env.MONGODB_DB || 'sumant_crafts';

async function sync() {
  console.log(`Connecting to MongoDB Atlas at ${dbName}...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully.');
    const db = client.db(dbName);

    const localDbPath = path.join(__dirname, '..', 'data', 'store_database.json');
    if (!fs.existsSync(localDbPath)) {
      console.error('store_database.json not found at', localDbPath);
      process.exit(1);
    }

    const localData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));

    // Collections to sync
    const collectionsToSync = [
      { name: 'products', data: localData.products || [], idKey: 'id' },
      { name: 'orders', data: localData.orders || [], idKey: 'id' },
      { name: 'coupons', data: localData.coupons || [], idKey: 'id' },
      { name: 'reviews', data: localData.reviews || [], idKey: 'id' },
      { name: 'adminUsers', data: localData.adminUsers || [], idKey: 'id' },
      { name: 'customers', data: localData.customers || [], idKey: 'id' },
    ];

    for (const item of collectionsToSync) {
      const col = db.collection(item.name);
      if (item.data.length > 0) {
        for (const doc of item.data) {
          const filter = { [item.idKey]: doc[item.idKey] };
          await col.replaceOne(filter, doc, { upsert: true });
        }
        console.log(`Synced ${item.data.length} records into collection "${item.name}".`);
      }
    }

    // Site Settings (Single Document)
    if (localData.siteSettings) {
      const settingsCol = db.collection('siteSettings');
      await settingsCol.replaceOne(
        { _id: 'global_settings' },
        { _id: 'global_settings', ...localData.siteSettings },
        { upsert: true }
      );
      console.log('Synced siteSettings document.');
    }

    console.log('\n🎉 ALL STORE DATA SUCCESSFULLY SYNCED TO MONGODB ATLAS!');
    await client.close();
  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
}

sync();
