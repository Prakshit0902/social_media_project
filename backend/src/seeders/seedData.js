// seeders/seed.js
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';
import { Story } from '../models/story.model.js';
import { Comment } from '../models/comments.model.js';
import { Chat } from '../models/chat.model.js';
import { Message } from '../models/message.model.js';

dotenv.config({ path: 'C:/PRAKSHIT/VS CODE/JAVASCRIPT/Full Stack Projects/social media project/backend/.env' });

// MongoDB connection
const connectDB = async () => {
  console.log('MongoDB URI:', process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
// const clearData = async () => {
//   try {
//     await User.deleteMany({});
//     await Post.deleteMany({});
//     await Story.deleteMany({});
//     await Comment.deleteMany({});
//     await Chat.deleteMany({});
//     await Message.deleteMany({});
//     console.log('Existing data cleared');
//   } catch (error) {
//     console.error('Error clearing data:', error);
//   }
// };

// Generate random hashtags
const generateHashtags = () => {
  const hashtags = [];
  const count = faker.number.int({ min: 1, max: 5 });
  for (let i = 0; i < count; i++) {
    hashtags.push(`#${faker.lorem.word()}${faker.number.int({ min: 1, max: 999 })}`);
  }
  return hashtags;
};

// Generate profile pictures
const generateProfilePicture = (gender) => {
  return faker.image.avatar();
};

// Main seeder function
const seedDatabase = async () => {
  try {
    await connectDB();
    // await clearData();

    console.log('Starting to seed database...');

    // 1. Create Users (200+)
    console.log('Creating users...');
    const users = [];
    const userCount = 200;

    for (let i = 0; i < userCount; i++) {
      const gender = faker.person.sexType();
      const firstName = faker.person.firstName(gender);
      const lastName = faker.person.lastName();
      
      const userData = {
        username: faker.internet.userName({ firstName, lastName }).toLowerCase(),
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        fullname: `${firstName} ${lastName}`,
        password: 'password123', // Will be hashed by pre-save hook
        profilePicture: generateProfilePicture(gender),
        gender: gender,
        dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        bio: faker.lorem.sentences({ min: 1, max: 3 }),
        isPrivate: faker.datatype.boolean({ probability: 0.3 }),
        isVerified: faker.datatype.boolean({ probability: 0.1 }),
        lastActive: faker.date.recent({ days: 7 }),
        isOnline: faker.datatype.boolean({ probability: 0.4 }),
        followers: [],
        following: [],
        followRequests: [],
        posts: [],
        stories: [],
        savedPosts: []
      };

      const user = await User.create(userData);
      users.push(user);
    }

    console.log(`Created ${users.length} users`);

    // 2. Create Followers/Following relationships
    console.log('Creating follower relationships...');
    for (const user of users) {
      const followingCount = faker.number.int({ min: 5, max: 50 });
      const potentialFollowing = users.filter(u => u._id.toString() !== user._id.toString());
      
      for (let i = 0; i < followingCount && i < potentialFollowing.length; i++) {
        const randomUser = faker.helpers.arrayElement(potentialFollowing);
        
        if (!user.following.includes(randomUser._id)) {
          user.following.push(randomUser._id);
          randomUser.followers.push(user._id);
          
          // Add follow requests for private accounts
          if (randomUser.isPrivate && faker.datatype.boolean({ probability: 0.3 })) {
            randomUser.followRequests.push(user._id);
          }
        }
      }
    }

    // Save all user updates
    await Promise.all(users.map(user => user.save()));

    // 3. Create Posts
    console.log('Creating posts...');
    const posts = [];
    for (const user of users) {
      const postCount = faker.number.int({ min: 0, max: 10 });
      
      for (let i = 0; i < postCount; i++) {
        const postType = faker.helpers.arrayElement(['image', 'video']);
        const postData = {
          owner: user._id,
          postType: postType,
          postContent: postType === 'image' 
            ? faker.image.urlPicsumPhotos({ width: 1080, height: 1080 })
            : faker.image.urlPicsumPhotos({ width: 1920, height: 1080 }),
          description: faker.lorem.paragraph(),
          hashTags: generateHashtags(),
          visibility: user.isPrivate ? 'followers' : faker.helpers.arrayElement(['public', 'followers']),
          isArchived: faker.datatype.boolean({ probability: 0.1 }),
          mentions: faker.helpers.arrayElements(users.map(u => u._id), { min: 0, max: 3 }),
          likes: 0,
          shares: 0,
          saves: 0,
          likedBy: []
        };

        const post = await Post.create(postData);
        posts.push(post);
        user.posts.push(post._id);
      }
    }

    // Save user posts
    await Promise.all(users.map(user => user.save()));

    // Add likes to posts
    console.log('Adding likes to posts...');
    for (const post of posts) {
      const likeCount = faker.number.int({ min: 0, max: 100 });
      const likers = faker.helpers.arrayElements(users, { min: 0, max: Math.min(likeCount, users.length) });
      
      post.likedBy = likers.map(u => u._id);
      post.likes = post.likedBy.length;
      
      await post.save();
    }

    // Save some posts
    console.log('Adding saved posts...');
    for (const user of users) {
      const savedCount = faker.number.int({ min: 0, max: 20 });
      const savedPosts = faker.helpers.arrayElements(posts, { min: 0, max: Math.min(savedCount, posts.length) });
      
      user.savedPosts = savedPosts.map(p => p._id);
      
      for (const post of savedPosts) {
        post.saves = (post.saves || 0) + 1;
        await post.save();
      }
      
      await user.save();
    }

    // 4. Create Stories
    console.log('Creating stories...');
    const stories = [];
    for (const user of users) {
      const hasActiveStory = faker.datatype.boolean({ probability: 0.6 });
      
      if (hasActiveStory) {
        const storyCount = faker.number.int({ min: 1, max: 5 });
        
        for (let i = 0; i < storyCount; i++) {
          const storyData = {
            owner: user._id,
            storyContent: faker.image.urlPicsumPhotos({ width: 1080, height: 1920 }),
            mentions: faker.helpers.arrayElements(users.map(u => u._id), { min: 0, max: 2 }),
            likes: 0,
            views: 0,
            likedBy: [],
            viewedBy: [],
            expiresAt: new Date(Date.now() + faker.number.int({ min: 1, max: 24 }) * 60 * 60 * 1000),
            isActive: true
          };

          const story = await Story.create(storyData);
          stories.push(story);
          user.stories.push(story._id);
        }
      }
    }

    // Save user stories
    await Promise.all(users.map(user => user.save()));

    // Add views and likes to stories
    console.log('Adding story views and likes...');
    for (const story of stories) {
      const storyOwner = users.find(u => u._id.toString() === story.owner.toString());
      const potentialViewers = storyOwner.followers.map(followerId => 
        users.find(u => u._id.toString() === followerId.toString())
      ).filter(Boolean);

      const viewerCount = faker.number.int({ min: 0, max: Math.min(potentialViewers.length, 50) });
      const viewers = faker.helpers.arrayElements(potentialViewers, { min: 0, max: viewerCount });
      
      story.viewedBy = viewers.map(viewer => ({
        userId: viewer._id,
        viewedAt: faker.date.recent({ days: 1 })
      }));
      story.views = story.viewedBy.length;

      // Some viewers also like the story
      const likers = faker.helpers.arrayElements(viewers, { min: 0, max: Math.floor(viewers.length * 0.3) });
      story.likedBy = likers.map(u => u._id);
      story.likes = story.likedBy.length;
      
      await story.save();
    }

    // 5. Create Comments
    console.log('Creating comments...');
    const comments = [];
    for (const post of posts) {
      const commentCount = faker.number.int({ min: 0, max: 15 });
      
      for (let i = 0; i < commentCount; i++) {
        const commentData = {
          post: post._id,
          user: faker.helpers.arrayElement(users)._id,
          content: faker.lorem.sentence(),
          mentions: faker.helpers.arrayElements(users.map(u => u._id), { min: 0, max: 2 }),
          likes: 0,
          likedBy: [],
          replies: [],
          isEdited: faker.datatype.boolean({ probability: 0.1 }),
          isDeleted: false
        };

        const comment = await Comment.create(commentData);
        comments.push(comment);
      }
    }

    // Add likes to comments
    for (const comment of comments) {
      const likeCount = faker.number.int({ min: 0, max: 20 });
      const likers = faker.helpers.arrayElements(users, { min: 0, max: Math.min(likeCount, users.length) });
      
      comment.likedBy = likers.map(u => u._id);
      comment.likes = comment.likedBy.length;
      
      await comment.save();
    }

    // Create comment replies
    console.log('Creating comment replies...');
    for (const comment of faker.helpers.arrayElements(comments, { min: 0, max: Math.floor(comments.length * 0.3) })) {
      const replyCount = faker.number.int({ min: 1, max: 5 });
      
      for (let i = 0; i < replyCount; i++) {
        const replyData = {
          post: comment.post,
          user: faker.helpers.arrayElement(users)._id,
          content: faker.lorem.sentence(),
          parentComment: comment._id,
          mentions: [comment.user],
          likes: 0,
          likedBy: [],
          replies: [],
          isEdited: false,
          isDeleted: false
        };

        const reply = await Comment.create(replyData);
        comment.replies.push(reply._id);
      }
      
      await comment.save();
    }

    // 6. Create Chats
    console.log('Creating chats...');
    const chats = [];
    
    // Create private chats
    const chatPairs = new Set();
    for (let i = 0; i < 100; i++) {
      const [user1, user2] = faker.helpers.arrayElements(users, 2);
      const pairKey = [user1._id, user2._id].sort().join('-');
      
      if (!chatPairs.has(pairKey)) {
        chatPairs.add(pairKey);
        
        const chatData = {
          participants: [user1._id, user2._id],
          chatType: 'private',
          isActive: true,
          mutedBy: faker.datatype.boolean({ probability: 0.1 }) ? [faker.helpers.arrayElement([user1._id, user2._id])] : [],
          unreadCounts: [
            { user: user1._id, count: 0 },
            { user: user2._id, count: 0 }
          ]
        };

        const chat = await Chat.create(chatData);
        chats.push(chat);
      }
    }

    // Create group chats
    for (let i = 0; i < 20; i++) {
      const participantCount = faker.number.int({ min: 3, max: 10 });
      const participants = faker.helpers.arrayElements(users, participantCount);
      const admin = faker.helpers.arrayElement(participants);
      
      const groupChatData = {
        participants: participants.map(p => p._id),
        chatType: 'group',
        groupName: faker.company.name(),
        groupAdmin: admin._id,
        groupIcon: faker.image.avatar(),
        isActive: true,
        mutedBy: [],
        unreadCounts: participants.map(p => ({ user: p._id, count: 0 }))
      };

      const groupChat = await Chat.create(groupChatData);
      chats.push(groupChat);
    }

    // 7. Create Messages
    console.log('Creating messages...');
    for (const chat of chats) {
              const messageCount = faker.number.int({ min: 5, max: 50 });
      
      for (let i = 0; i < messageCount; i++) {
        const sender = faker.helpers.arrayElement(chat.participants);
        const messageType = faker.helpers.arrayElement(['text', 'image', 'video', 'file']);
        const messageData = {
          chatId: chat._id,
          sender: sender,
          messageType: messageType,
          content: messageType === 'text' 
            ? faker.lorem.sentence() 
            : faker.image.urlLoremFlickr({ category: messageType === 'image' ? 'nature' : 'technology' }),
          status: faker.helpers.arrayElement(['sent', 'delivered', 'read']),
          isDeleted: faker.datatype.boolean({ probability: 0.05 }),
          readBy: [],
        };

        // Add replyTo for some messages
        if (i > 0 && faker.datatype.boolean({ probability: 0.2 })) {
          const previousMessages = await Message.find({ chatId: chat._id }).limit(i);
          if (previousMessages.length > 0) {
            messageData.replyTo = faker.helpers.arrayElement(previousMessages)._id;
          }
        }

        const message = await Message.create(messageData);
        
        // Update last message in chat
        chat.lastMessage = message._id;
        
        // Update unread counts
        chat.unreadCounts = chat.unreadCounts.map(uc => {
          if (uc.user.toString() !== sender.toString() && message.status !== 'read') {
            return { user: uc.user, count: uc.count + 1 };
          }
          return uc;
        });

        // Add readBy for some messages
        if (message.status === 'read') {
          const readers = faker.helpers.arrayElements(
            chat.participants.filter(p => p.toString() !== sender.toString()),
            { min: 0, max: chat.participants.length - 1 }
          );
          message.readBy = readers.map(reader => ({
            userId: reader,
            readAt: faker.date.recent({ days: 1 })
          }));
          await message.save();
        }
      }
      
      await chat.save();
    }

    console.log(`Created messages for ${chats.length} chats`);

    console.log('Database seeding completed successfully!');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${posts.length} posts`);
    console.log(`Created ${stories.length} stories`);
    console.log(`Created ${comments.length} comments`);
    console.log(`Created ${chats.length} chats`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeder
seedDatabase();