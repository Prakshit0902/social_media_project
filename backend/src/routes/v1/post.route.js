import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { toggleLike } from "../../controller/post.controller.js";
import { createPost } from "../../controller/post.controller.js";
import { upload } from "../../middlewares/multer.middleware.js";

const router = Router()

router.route('/like').post(verifyJWT,toggleLike)
router.route('/create').post(verifyJWT,upload.single('media'),createPost)
export default router