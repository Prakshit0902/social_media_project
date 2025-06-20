import mongoose from 'mongoose';

export const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing database...');
    
    // Get all collections
    const collections = mongoose.connection.collections;
    
    // Clear each collection
    for (const key in collections) {
      const collection = collections[key];
      try {
        await collection.deleteMany({});
        console.log(`  ✓ ${key} collection cleared`);
      } catch (error) {
        console.log(`  ⚠️  Error clearing ${key}:`, error.message);
      }
    }
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};