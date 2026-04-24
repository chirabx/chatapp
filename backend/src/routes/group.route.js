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

// 群组管理路由 - 注意顺序：具体路由在前，参数路由在后
router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.put("/:groupId", protectRoute, updateGroup);
router.delete("/:groupId", protectRoute, deleteGroup);
router.get("/:groupId", protectRoute, getGroupDetails);

// 群成员管理路由
router.post("/:groupId/members", protectRoute, addMember);
router.delete("/:groupId/members/:memberId", protectRoute, removeMember);
router.post("/:groupId/leave", protectRoute, leaveGroup);

export default router;
