const { MongoClient } = require('mongodb');

async function createTestToken() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('bitrix-oauth');
    const collection = db.collection('tokens');
    
    const testToken = {
      domain: 'test.bitrix24.com',
      accessToken: 'test_access_token_12345',
      refreshToken: 'test_refresh_token_67890',
      expiresIn: 3600,
      expiresAt: new Date(Date.now() + 3600 * 1000),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await collection.deleteOne({ domain: 'test.bitrix24.com' });
    const result = await collection.insertOne(testToken);
    console.log('Test token created:', result.insertedId);
    
    const savedToken = await collection.findOne({ domain: 'test.bitrix24.com' });
    console.log('Saved token:', savedToken);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createTestToken();
