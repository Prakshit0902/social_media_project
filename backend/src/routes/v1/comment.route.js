import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { createComment, deleteComment, editComment, getCommentsByPostId, replyToComment } from "../../controller/comment.controller.js";



const router = Router()

router.route('/get-post-comment').post(verifyJWT,getCommentsByPostId)
router.route('/create-comment').post(verifyJWT,createComment)
router.route('/:id').patch(verifyJWT,editComment)
router.route('/:id').delete(verifyJWT,deleteComment)
router.route('/reply').post(verifyJWT,replyToComment)

export default router