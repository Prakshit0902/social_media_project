import { Router } from 'express';
import { generateAIResponse } from '../../controller/ai.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';

const router = Router();

// Protected route - requires authentication
router.route('/chat').post(verifyJWT, generateAIResponse);

export default router;