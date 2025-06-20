import { faker } from '@faker-js/faker';
import { Comment } from '../../models/comments.model.js';
import credentials from '../config/credentials.js';
import { getRandomElements, getRandomElement } from '../utils/helpers.js';

export const seedComments = async (users, posts) => {
  try {
    console.log('💬 Seeding comments...');
    const comments = [];
    let totalComments = 0;

    for (const post of posts) {
      const commentCount = faker.number.int(credentials.commentsPerPost);
      const commenters = getRandomElements(users, commentCount);
      const postComments = [];

      // Create top-level comments
      for (const commenter of commenters) {
        const mentions = faker.datatype.boolean(0.3) 
          ? getRandomElements(users, faker.number.int({ min: 1, max: 2 }))
          : [];

        const comment = new Comment({
          post: post._id,
          user: commenter._id,
          content: faker.lorem.sentences({ min: 1, max: 3 }),
          mentions: mentions.map(u => u._id),
          createdAt: faker.date.between({ 
            from: post.createdAt, 
            to: new Date() 
          })
        });

        comments.push(comment);
        postComments.push(comment);
      }

      // Create replies (30% chance for each comment)
      const savedPostComments = await Comment.insertMany(postComments);
      
      for (const parentComment of savedPostComments) {
        if (faker.datatype.boolean(0.3)) {
          const replier = getRandomElement(users);
          const reply = new Comment({
            post: post._id,
            user: replier._id,
            content: faker.lorem.sentences({ min: 1, max: 2 }),
            parentComment: parentComment._id,
            mentions: [parentComment.user],
            createdAt: faker.date.between({ 
              from: parentComment.createdAt, 
              to: new Date() 
            })
          });

          comments.push(reply);
          parentComment.replies.push(reply._id);
          await parentComment.save();
        }
      }

      totalComments += postComments.length;
    }

    // Save all comments
    const savedComments = await Comment.insertMany(comments.filter(c => !c._id));
    console.log(`✅ Created ${savedComments.length + totalComments} comments`);

    // Add likes to comments
    console.log('❤️  Adding comment likes...');
    const allComments = await Comment.find({});
    
    for (const comment of allComments) {
      const likeCount = faker.number.int({ min: 0, max: 20 });
      const likers = getRandomElements(users, likeCount);
      comment.likedBy = likers.map(u => u._id);
      comment.likes = comment.likedBy.length;
      await comment.save();
    }

    // Update posts with comment references
    console.log('🔗 Linking comments to posts...');
    for (const post of posts) {
      const postComments = allComments.filter(c => c.post.toString() === post._id.toString());
      post.comments = postComments.map(c => c._id);
      await post.save();
    }

    // Update users' commentedPosts
    for (const user of users) {
      const userComments = allComments.filter(c => c.user.toString() === user._id.toString());
      user.commentedPosts = userComments.map(c => c._id);
      await user.save();
    }

    console.log('✅ Comments linked to posts and users');
    return allComments;
  } catch (error) {
    console.error('❌ Error seeding comments:', error);
    throw error;
  }
};