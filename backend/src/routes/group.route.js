import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createGroup,
    getGroups,
    getGroupDetails,
    updateGroup,
    addMember,
    removeMember,
    leaveGroup,
    deleteGroup
} from "../controllers/group.controller.js";

const router = express.Router();

// 群组管理路由
router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.get("/:groupId", protectRoute, getGroupDetails);
router.put("/:groupId", protectRoute, updateGroup);
router.delete("/:groupId", protectRoute, deleteGroup);

// 群成员管理路由
router.post("/:groupId/members", protectRoute, addMember);
router.delete("/:groupId/members/:memberId", protectRoute, removeMember);
router.post("/:groupId/leave", protectRoute, leaveGroup);

export default router;
