import { faker } from '@faker-js/faker';
import { User } from '../../models/user.model.js';
import credentials from '../config/credentials.js';
import { getRandomElements } from '../utils/helpers.js';

export const seedUsers = async () => {
  try {
    console.log('👥 Seeding 200 users...');
    const users = [];
    const userCount = credentials.userCount || 200;

    // Create test users from credentials
    for (const testUser of credentials.testUsers) {
      const user = new User({
        username: testUser.username,
        email: testUser.email,
        fullname: testUser.fullname,
        password: credentials.defaultPassword,
        profilePicture: faker.image.avatar(),
        gender: faker.helpers.arrayElement(['male', 'female']),
        dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        bio: faker.person.bio(),
        isPrivate: faker.datatype.boolean(0.3),
        isVerified: testUser.isVerified,
        isOnline: faker.datatype.boolean(0.4),
        lastActive: faker.date.recent({ days: 7 })
      });
      users.push(user);
    }

    // Create additional random users to reach 200
    for (let i = 0; i < userCount - credentials.testUsers.length; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = faker.internet.userName({ firstName, lastName }).toLowerCase().replace(/[^a-z0-9_]/g, '');
      
      const user = new User({
        username: username + faker.number.int({ min: 100, max: 9999 }),
        email: faker.internet.email({ firstName, lastName }),
        fullname: `${firstName} ${lastName}`,
        password: credentials.defaultPassword,
        profilePicture: faker.image.avatar(),
        gender: faker.helpers.arrayElement(['male', 'female']),
        dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        bio: faker.person.bio(),
        isPrivate: faker.datatype.boolean(0.3),
        isVerified: faker.datatype.boolean(0.15), // 15% verified
        isOnline: faker.datatype.boolean(0.3),
        lastActive: faker.date.recent({ days: 30 })
      });
      users.push(user);
    }

    // Save all users first
    const savedUsers = await User.insertMany(users);
    console.log(`✅ Created ${savedUsers.length} users`);

    // Create follow relationships in batches to avoid memory issues
    console.log('🔗 Creating follow relationships...');
    const batchSize = 50;
    
    for (let i = 0; i < savedUsers.length; i += batchSize) {
      const batch = savedUsers.slice(i, i + batchSize);
      
      for (const user of batch) {
        // Each user follows between 10-50 others
        const followCount = faker.number.int({ min: 10, max: 50 });
        const usersToFollow = getRandomElements(
          savedUsers.filter(u => u._id.toString() !== user._id.toString()),
          followCount
        );

        user.following = usersToFollow.map(u => u._id);
        
        // Handle follow requests for private accounts
        const pendingRequests = [];
        for (const targetUser of usersToFollow) {
          if (!targetUser.followers.includes(user._id)) {
            targetUser.followers.push(user._id);
          }
          
          // 20% chance of pending follow request for private accounts
          if (targetUser.isPrivate && faker.datatype.boolean(0.2)) {
            pendingRequests.push(targetUser);
            targetUser.followRequests.push(user._id);
          }
        }
      }
      
      // Save batch
      await Promise.all(batch.map(user => user.save()));
      console.log(`  Processed ${Math.min(i + batchSize, savedUsers.length)}/${savedUsers.length} users`);
    }

    console.log('✅ Follow relationships created');
    return savedUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};