const { MongoClient } = require('mongodb');

async function createTestToken() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('bitrix-oauth');
    const collection = db.collection('tokens');
    
    // Tạo token test
    const testToken = {
      domain: 'test.bitrix24.com',
      accessToken: 'test_access_token_12345',
      refreshToken: 'test_refresh_token_67890',
      expiresIn: 3600,
      expiresAt: new Date(Date.now() + 3600 * 1000), // 1 giờ sau
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Xóa token cũ nếu có 
    await collection.deleteOne({ domain: 'test.bitrix24.com' });
    
    // Thêm token mới
    const result = await collection.insertOne(testToken);
    console.log('Test token created:', result.insertedId);
    
    // Kiểm tra token đã được lưu
    const savedToken = await collection.findOne({ domain: 'test.bitrix24.com' });
    console.log('Saved token:', savedToken);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createTestToken();
