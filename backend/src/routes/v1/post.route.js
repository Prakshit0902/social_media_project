import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { toggleLike } from "../../controller/post.controller.js";

const router = Router()

router.route('/like').post(verifyJWT,toggleLike)

export default router