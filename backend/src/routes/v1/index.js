import { Router } from 'express';
import userRoutes from './user.route.js';
import postRoutes from './post.route.js';
import commentRoutes from './comment.route.js';

const router = Router();

router.use('/user', userRoutes);
router.use('/post',postRoutes)
router.use('/comment',commentRoutes)

export default router;