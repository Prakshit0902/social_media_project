import mongoose from 'mongoose';
import { connectAndRegister } from './utils/connectAndRegisterModels.js';
import { clearDatabase } from './data/clearDatabase.js';
import { seedUsers } from './data/userSeeder.js';
import { seedPosts } from './data/postSeeder.js';
import { seedStories } from './data/storySeeder.js';
import { seedComments } from './data/commentSeeder.js';
import { seedChats } from './data/chatSeeder.js';
import { seedMessages } from './data/messageSeeder.js';
import  credentials  from './config/credentials.js';

const seedDatabase = async () => {
  const startTime = Date.now();
  let models;
  
  try {
    // Connect and register all models
    models = await connectAndRegister();
    
    // Verify models are loaded
    console.log('📋 Models registered:', Object.keys(models).join(', '));
    
    // Wait a bit to ensure connection is stable
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clear existing data
    await clearDatabase();

    // Seed data in order
    console.log('\n🌱 Starting database seeding...\n');
    
    // 1. Create users
    const users = await seedUsers();
    
    // 2. Create posts
    const posts = await seedPosts(users);
    
    // 3. Create stories
    const stories = await seedStories(users);
    
    // 4. Create comments
    const comments = await seedComments(users, posts);
    
    // 5. Create chats
    const chats = await seedChats(users);
    
    // 6. Create messages
    await seedMessages(chats);

    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n📊 Seeding Summary:');
    console.log('═'.repeat(50));
    console.log(`✅ Users: ${users.length}`);
    console.log(`✅ Posts: ${posts.length}`);
    console.log(`✅ Stories: ${stories.length}`);
    console.log(`✅ Comments: ${comments.length}`);
    console.log(`✅ Chats: ${chats.length}`);
    console.log(`✅ Time taken: ${duration} seconds`);
    console.log('═'.repeat(50));
    
    console.log('\n🔑 Test Credentials:');
    console.log('─'.repeat(50));
    credentials.testUsers.forEach(user => {
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${credentials.defaultPassword}`);
      console.log('─'.repeat(50));
    });

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    try {
      await mongoose.connection.close();
      console.log('\n👋 MongoDB connection closed');
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('\n👋 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

// Run seeder
seedDatabase();