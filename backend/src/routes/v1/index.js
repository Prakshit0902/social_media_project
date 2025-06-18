import { Router } from 'express';
import userRoutes from './user.route.js';
import postRoutes from './post.route.js';

const router = Router();

router.use('/user', userRoutes);
router.use('/post',postRoutes)

export default router;