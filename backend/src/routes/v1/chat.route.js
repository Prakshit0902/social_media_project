import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import {
    getUserChats,
    createOrGetPrivateChat,
    createGroupChat,
    getChatMessages,
    sendMessage,
    deleteMessage,
    markMessagesAsRead
} from "../../controller/chat.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Chat routes
router.get("/", getUserChats);
router.post("/private", createOrGetPrivateChat);
router.post("/group", createGroupChat);

// Message routes
router.get("/:chatId/messages", getChatMessages);
router.post("/message", sendMessage);
router.delete("/message/:messageId", deleteMessage);
router.patch("/:chatId/read", markMessagesAsRead);

export default router;