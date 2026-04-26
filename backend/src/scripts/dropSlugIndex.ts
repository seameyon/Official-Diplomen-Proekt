import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropSlugIndex = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/animeal';
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const collection = db.collection('recipes');
    
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    const slugIndex = indexes.find(i => i.name === 'slug_1');
    
    if (slugIndex) {
      console.log('Found slug_1 index, dropping it...');
      await collection.dropIndex('slug_1');
      console.log('✅ slug_1 index dropped successfully!');
    } else {
      console.log('✅ No slug_1 index found, nothing to drop.');
    }
    
    const indexesAfter = await collection.indexes();
    console.log('Indexes after:', indexesAfter.map(i => i.name));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

dropSlugIndex();
