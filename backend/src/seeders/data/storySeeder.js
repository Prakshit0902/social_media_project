import { faker } from '@faker-js/faker';
import { Story } from '../../models/story.model.js';
import credentials from '../config/credentials.js' ;
import { getRandomElements } from '../utils/helpers.js';

export const seedStories = async (users) => {
  try {
    console.log('📸 Seeding stories...');
    const stories = [];
    
    // 60% of users have active stories
    const usersWithStories = getRandomElements(users, Math.floor(users.length * 0.6));

    for (const user of usersWithStories) {
      const storyCount = faker.number.int(credentials.storiesPerUser);
      
      for (let i = 0; i < storyCount; i++) {
        // Recent stories (within last 24 hours)
        const createdAt = faker.date.recent({ days: 1 });
        const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

        // Random mentions from user's followers
        const mentions = getRandomElements(user.followers, faker.number.int({ min: 0, max: 2 }));

        const story = new Story({
          owner: user._id,
          media: {
            url: faker.helpers.arrayElement([
              faker.image.urlPicsumPhotos({ width: 1080, height: 1920 }),
              `https://example.com/videos/story_${faker.string.uuid()}.mp4`
            ]),
            type: faker.helpers.arrayElement(['image', 'video'])
          },
          caption: faker.datatype.boolean(0.7) ? faker.lorem.sentence() : '',
          mentions,
          createdAt,
          expiresAt,
          isActive: expiresAt > new Date()
        });

        stories.push(story);
      }
    }

    // Save all stories
    const savedStories = await Story.insertMany(stories);
    console.log(`✅ Created ${savedStories.length} stories`);

    // Add views
    console.log('👀 Adding story views...');
    for (const story of savedStories) {
      // Get story owner's followers
      const storyOwner = users.find(u => u._id.toString() === story.owner.toString());
      const viewers = getRandomElements(storyOwner.followers, 
        faker.number.int({ min: 0, max: Math.min(storyOwner.followers.length, 50) })
      );

      story.viewedBy = viewers.map(viewerId => ({
        user: viewerId,
        viewedAt: faker.date.between({ 
          from: story.createdAt, 
          to: new Date() 
        })
      }));
      story.views = story.viewedBy.length;

      await story.save();
    }

    // Update users' stories arrays
    for (const user of users) {
      const userStories = savedStories.filter(s => s.owner.toString() === user._id.toString());
      user.stories = userStories.map(s => s._id);
      await user.save();
    }

    console.log('✅ Stories linked to users');
    return savedStories;
  } catch (error) {
    console.error('❌ Error seeding stories:', error);
    throw error;
  }
};