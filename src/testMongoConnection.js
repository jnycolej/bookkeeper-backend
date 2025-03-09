// testMongoConnection.js

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://host.docker.internal:27017/bookkeeper';

async function testConnection() {
  try {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log('Successfully connected to MongoDB');

    const databasesList = await client.db().admin().listDatabases();
    console.log('Databases:');
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));

    await client.close();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
}

testConnection();
