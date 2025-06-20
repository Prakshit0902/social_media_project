import mongoose from 'mongoose';
import dotenv from 'dotenv';


// Import all models to register them
import { User } from '../../models/user.model.js';
import { Post } from '../../models/post.model.js';
import { Story } from '../../models/story.model.js';
import { Comment } from '../../models/comments.model.js';
import { Chat } from '../../models/chat.model.js';
import { Message } from '../../models/message.model.js';


dotenv.config({ path: '../../.env' });

export const connectAndRegister = async () => {
  try {
    // Ensure no existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const mongoUri = process.env.MONGODB_URI ;
    console.log('🔌 Connecting to MongoDB:', mongoUri);
    
    // Connect with specific options
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false, // Disable buffering
    });

    // Verify connection
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB connected and ready');

    // Return models for verification
    return {
      User,
      Post,
      Story,
      Comment,
      Chat,
      Message
    };
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};