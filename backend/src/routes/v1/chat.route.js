import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import {
    getUserChats,
    createOrGetPrivateChat,
    createGroupChat,
    getChatMessages,
    sendMessage,
    deleteMessage,
    markMessagesAsRead,
    uploadMediaMessage,
    editMessage,
    toggleMuteChat,
    searchMessages,
    leaveGroupChat
} from "../../controller/chat.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Chat routes
router.get("/", getUserChats);
router.post("/private", createOrGetPrivateChat);
router.post("/group", createGroupChat);
router.patch("/:chatId/mute", toggleMuteChat);
router.post("/:chatId/leave", leaveGroupChat);

// Message routes
router.get("/:chatId/messages", getChatMessages);
router.get("/:chatId/search", searchMessages);
router.post("/message", sendMessage);
router.post("/message/media", upload.single('file'), uploadMediaMessage);
router.patch("/message/:messageId", editMessage);
router.delete("/message/:messageId", deleteMessage);
router.patch("/:chatId/read", markMessagesAsRead);

export default router;