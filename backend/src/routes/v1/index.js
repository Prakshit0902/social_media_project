import { Router } from 'express';
import userRoutes from './user.route.js';
import postRoutes from './post.route.js';
import commentRoutes from './comment.route.js';
import chatRoutes from './chat.route.js';

const router = Router();

router.use('/user', userRoutes);
router.use('/post',postRoutes)
router.use('/comment',commentRoutes)
router.use('/chat',chatRoutes)

export default router;