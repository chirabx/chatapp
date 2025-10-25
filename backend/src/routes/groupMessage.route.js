import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    sendGroupMessage,
    getGroupMessages,
    deleteGroupMessage,
    getGroupMembers,
    clearGroupChatHistory
} from "../controllers/groupMessage.controller.js";

const router = express.Router();

// 群组消息路由
router.post("/:groupId/send", protectRoute, sendGroupMessage);
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.delete("/:messageId", protectRoute, deleteGroupMessage);
router.get("/:groupId/members", protectRoute, getGroupMembers);
router.delete("/:groupId/clear", protectRoute, clearGroupChatHistory);

export default router;
