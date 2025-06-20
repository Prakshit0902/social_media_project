import { faker } from '@faker-js/faker';
import { Post } from '../../models/post.model.js';
import { User } from '../../models/user.model.js';
import credentials from '../config/credentials.js';
import { getRandomElements, generateHashtags, generateMediaUrls } from '../utils/helpers.js';

export const seedPosts = async (users) => {
  try {
    console.log('📝 Seeding posts...');
    const posts = [];
    let totalPosts = 0;

    for (const user of users) {
      const postCount = faker.number.int(credentials.postsPerUser);
      
      for (let i = 0; i < postCount; i++) {
        // Random mentions from user's followers/following
        const mentionCandidates = [...new Set([
          ...user.followers.slice(0, 10),
          ...user.following.slice(0, 10)
        ])];
        const mentions = getRandomElements(mentionCandidates, faker.number.int({ min: 0, max: 3 }));

        // Generate caption with hashtags
        const hashtags = generateHashtags(faker.number.int({ min: 0, max: 5 }));
        const captionText = faker.lorem.paragraph();
        const caption = hashtags.length > 0 
          ? `${captionText} ${hashtags.map(tag => `#${tag}`).join(' ')}`
          : captionText;

        // Generate media (1-3 images/videos per post)
        const mediaType = faker.helpers.arrayElement(['image', 'video']);
        const mediaCount = faker.number.int({ min: 1, max: 3 });
        const media = generateMediaUrls(mediaType, mediaCount);

        const post = new Post({
          owner: user._id,
          media,
          caption,
          mentions,
          hashtags,
          createdAt: faker.date.recent({ days: 90 }),
          isArchived: faker.datatype.boolean(0.05) // 5% archived
        });

        posts.push(post);
      }
      
      totalPosts += postCount;
    }

    // Save all posts
    const savedPosts = await Post.insertMany(posts);
    console.log(`✅ Created ${savedPosts.length} posts`);

    // Add likes and saves
    console.log('❤️  Adding likes and saves...');
    for (const post of savedPosts) {
      // Random users like the post (0-30% of users)
      const likeCount = faker.number.int({ min: 0, max: Math.floor(users.length * 0.3) });
      const likers = getRandomElements(users, likeCount);
      post.likedBy = likers.map(u => u._id);
      post.likes = post.likedBy.length;

      // Random users save the post (0-10% of users)
      const saveCount = faker.number.int({ min: 0, max: Math.floor(users.length * 0.1) });
      const savers = getRandomElements(users, saveCount);
      post.savedBy = savers.map(u => u._id);

      // Update user's likedPosts and savedPosts
      for (const liker of likers) {
        if (!liker.likedPosts.includes(post._id)) {
          liker.likedPosts.push(post._id);
        }
      }

      for (const saver of savers) {
        if (!saver.savedPosts.includes(post._id)) {
          saver.savedPosts.push(post._id);
        }
      }

      await post.save();
    }

    // Update users' posts arrays
    console.log('🔗 Linking posts to users...');
    for (const user of users) {
      const userPosts = savedPosts.filter(p => p.owner.toString() === user._id.toString());
      user.posts = userPosts.map(p => p._id);
      await user.save();
    }

    console.log(`✅ Posts linked to users`);
    return savedPosts;
  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    throw error;
  }
};