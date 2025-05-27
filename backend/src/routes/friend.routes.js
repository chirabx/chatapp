import express from "express";
import {
    sendFriendRequest,
    getFriendRequests,
    respondToFriendRequest,
    getFriends,
    removeFriend,
    markRequestsAsRead
} from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send-request", protectRoute, sendFriendRequest);
router.get("/requests", protectRoute, getFriendRequests);
router.put("/requests/mark-read", protectRoute, markRequestsAsRead);
router.put("/requests/:requestId", protectRoute, respondToFriendRequest);
router.get("/", protectRoute, getFriends);
router.delete("/:friendId", protectRoute, removeFriend);

export default router; 