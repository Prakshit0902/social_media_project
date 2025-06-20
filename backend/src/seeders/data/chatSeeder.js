import { faker } from '@faker-js/faker';
import { Chat } from '../../models/chat.model.js';
import { getRandomElements, getRandomElement } from '../utils/helpers.js';

export const seedChats = async (users) => {
  try {
    console.log('💬 Seeding chats...');
    const chats = [];
    
    // Create private chats (each user has 5-15 private chats)
    console.log('📱 Creating private chats...');
    const privateChatsMap = new Map(); // To avoid duplicate chats
    
    for (const user of users) {
      const chatPartners = getRandomElements(
        users.filter(u => u._id.toString() !== user._id.toString()),
        faker.number.int({ min: 5, max: 15 })
      );

      for (const partner of chatPartners) {
        // Create unique key for chat pair
        const chatKey = [user._id.toString(), partner._id.toString()].sort().join('-');
        
        if (!privateChatsMap.has(chatKey)) {
          const chat = new Chat({
            participants: [user._id, partner._id],
            chatType: 'private',
            lastMessageAt: faker.date.recent({ days: 30 }),
            isActive: faker.datatype.boolean(0.9),
            unreadCounts: [
              {
                user: user._id,
                count: faker.number.int({ min: 0, max: 10 })
              },
              {
                user: partner._id,
                count: faker.number.int({ min: 0, max: 10 })
              }
            ]
          });

          // Random muting (10% chance)
          if (faker.datatype.boolean(0.1)) {
            chat.mutedBy.push(faker.helpers.arrayElement([user._id, partner._id]));
          }

          privateChatsMap.set(chatKey, chat);
          chats.push(chat);
        }
      }
    }

    // Create group chats (50 groups with 3-20 members each)
    console.log('👥 Creating group chats...');
    const groupCount = 50;
    
    for (let i = 0; i < groupCount; i++) {
      const memberCount = faker.number.int({ min: 3, max: 20 });
      const members = getRandomElements(users, memberCount);
      const admin = getRandomElement(members);

      const groupChat = new Chat({
        participants: members.map(m => m._id),
        chatType: 'group',
        groupName: faker.company.name() + ' ' + faker.helpers.arrayElement(['Chat', 'Group', 'Team', 'Squad']),
        groupAdmin: admin._id,
        groupIcon: faker.image.avatar(),
        lastMessageAt: faker.date.recent({ days: 30 }),
        isActive: faker.datatype.boolean(0.95),
        unreadCounts: members.map(member => ({
          user: member._id,
          count: faker.number.int({ min: 0, max: 50 })
        }))
      });

      // Random members mute the group (20% chance per member)
      const mutedByMembers = members.filter(() => faker.datatype.boolean(0.2));
      groupChat.mutedBy = mutedByMembers.map(m => m._id);

      chats.push(groupChat);
    }

    // Save all chats
    const savedChats = await Chat.insertMany(chats);
    console.log(`✅ Created ${savedChats.length} chats (${privateChatsMap.size} private, ${groupCount} group)`);
    
    return savedChats;
  } catch (error) {
    console.error('❌ Error seeding chats:', error);
    throw error;
  }
};