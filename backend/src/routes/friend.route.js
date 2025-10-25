import express from "express";
import { sendFriendRequest, getFriends } from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add", protectRoute, sendFriendRequest);
router.get("/list", protectRoute, getFriends);

export default router;