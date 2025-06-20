import { faker } from '@faker-js/faker';
import { Message } from '../../models/message.model.js';
import credentials from '../config/credentials.js';
import { getRandomElement } from '../utils/helpers.js';

export const seedMessages = async (chats) => {
  try {
    console.log('📨 Seeding messages...');
    let totalMessages = 0;
    const batchSize = 100; // Process chats in batches

    for (let i = 0; i < chats.length; i += batchSize) {
      const chatBatch = chats.slice(i, i + batchSize);
      const messages = [];

      for (const chat of chatBatch) {
        const messageCount = faker.number.int(credentials.messagesPerChat);
        const chatMessages = [];

        for (let j = 0; j < messageCount; j++) {
          const sender = getRandomElement(chat.participants);
          const messageType = faker.helpers.weighted(
            ['text', 'image', 'video', 'file'],
            [70, 20, 5, 5] // 70% text, 20% image, 5% video, 5% file
          );

          let content, mediaInfo;
          
          switch (messageType) {
            case 'text':
              content = faker.lorem.sentences({ min: 1, max: 3 });
              break;
            case 'image':
              content = faker.image.urlPicsumPhotos();
              mediaInfo = {
                fileName: `IMG_${faker.number.int({ min: 1000, max: 9999 })}.jpg`,
                fileSize: faker.number.int({ min: 100000, max: 5000000 })
              };
              break;
            case 'video':
              content = `https://example.com/videos/${faker.string.uuid()}.mp4`;
              mediaInfo = {
                fileName: `VID_${faker.number.int({ min: 1000, max: 9999 })}.mp4`,
                fileSize: faker.number.int({ min: 1000000, max: 50000000 }),
                duration: faker.number.int({ min: 5, max: 300 }),
                thumbnail: faker.image.urlPicsumPhotos()
              };
              break;
            case 'file':
              content = `https://example.com/files/${faker.string.uuid()}.pdf`;
              mediaInfo = {
                fileName: faker.system.fileName(),
                fileSize: faker.number.int({ min: 10000, max: 10000000 })
              };
              break;
          }

          const createdAt = faker.date.between({
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            to: new Date()
          });

          const message = new Message({
            chatId: chat._id,
            sender: sender,
            messageType,
            content,
            mediaInfo,
            createdAt,
            status: 'sent'
          });

          // Add reply reference (20% chance if there are previous messages)
          if (chatMessages.length > 0 && faker.datatype.boolean(0.2)) {
            message.replyTo = getRandomElement(chatMessages)._id;
          }

          chatMessages.push(message);
          messages.push(message);
        }

        // Sort messages by time
        chatMessages.sort((a, b) => a.createdAt - b.createdAt);

        // Update read/delivered status
        const lastMessage = chatMessages[chatMessages.length - 1];
        for (const participant of chat.participants) {
          if (participant.toString() !== lastMessage.sender.toString()) {
            // 80% chance message is delivered
            if (faker.datatype.boolean(0.8)) {
              lastMessage.deliveredTo.push({
                userId: participant,
                deliveredAt: faker.date.between({
                  from: lastMessage.createdAt,
                  to: new Date()
                })
              });

              // 60% chance delivered message is read
              if (faker.datatype.boolean(0.6)) {
                lastMessage.readBy.push({
                  userId: participant,
                  readAt: faker.date.between({
                    from: lastMessage.createdAt,
                    to: new Date()
                  })
                });
                lastMessage.status = 'read';
              } else {
                lastMessage.status = 'delivered';
              }
            }
          }
        }

        // Update chat's last message
        chat.lastMessage = lastMessage._id;
        chat.lastMessageAt = lastMessage.createdAt;
      }

      // Save messages in batch
      const savedMessages = await Message.insertMany(messages);
      totalMessages += savedMessages.length;

      // Update chats
      await Promise.all(chatBatch.map(chat => chat.save()));

      console.log(`  Processed ${Math.min(i + batchSize, chats.length)}/${chats.length} chats`);
    }

    console.log(`✅ Created ${totalMessages} messages`);
    return totalMessages;
  } catch (error) {
    console.error('❌ Error seeding messages:', error);
    throw error;
  }
};