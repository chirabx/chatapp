import GroupMessage from "../models/groupMessage.model.js";
import Group from "../models/group.model.js";
import { getIO } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

// 发送群组消息
export const sendGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { text, image } = req.body;
        const senderId = req.user._id;

        // 检查用户是否是群成员
        const group = await Group.findOne({
            _id: groupId,
            "members.user": senderId
        });

        if (!group) {
            return res.status(404).json({ message: "群组不存在或您不是群成员" });
        }

        if (!text && !image) {
            return res.status(400).json({ message: "消息内容不能为空" });
        }

        let imageUrl;
        if (image) {
            // 上传图片到 Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new GroupMessage({
            groupId,
            senderId,
            text,
            image: imageUrl,
            messageType: image ? "image" : "text"
        });

        await newMessage.save();

        // 填充发送者信息
        await newMessage.populate("senderId", "fullName email profilePic");

        // 通知群组房间的所有成员
        const io = getIO();
        io.to(`group_${groupId}`).emit("newGroupMessage", newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("发送群组消息失败:", error);
        res.status(500).json({ message: "发送群组消息失败" });
    }
};

// 获取群组消息历史
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const userId = req.user._id;

        // 检查用户是否是群成员（优化查询）
        const group = await Group.findOne({
            _id: groupId,
            "members.user": userId
        }).select("_id members");

        if (!group) {
            return res.status(404).json({ message: "群组不存在或您不是群成员" });
        }

        const skip = (page - 1) * limit;

        // 优化查询：只获取必要的字段，添加索引提示
        const messages = await GroupMessage.find({ groupId })
            .populate("senderId", "fullName profilePic") // 移除email字段
            .sort({ createdAt: -1 }) // 使用索引排序
            .limit(parseInt(limit))
            .skip(skip)
            .lean(); // 使用lean()提高性能

        res.status(200).json(messages.reverse());
    } catch (error) {
        console.error("获取群组消息失败:", error);
        res.status(500).json({ message: "获取群组消息失败" });
    }
};

// 删除群组消息
export const deleteGroupMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await GroupMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "消息不存在" });
        }

        // 检查用户是否是群成员
        const group = await Group.findOne({
            _id: message.groupId,
            "members.user": userId
        });

        if (!group) {
            return res.status(404).json({ message: "群组不存在或您不是群成员" });
        }

        // 只有发送者或管理员可以删除消息
        const isSender = message.senderId.toString() === userId;
        const isAdmin = group.members.some(
            member => member.user.toString() === userId && member.role === "admin"
        );

        if (!isSender && !isAdmin) {
            return res.status(403).json({ message: "您没有权限删除此消息" });
        }

        await GroupMessage.findByIdAndDelete(messageId);

        // 通知群组房间的所有成员
        const io = getIO();
        io.to(`group_${message.groupId}`).emit("groupMessageDeleted", {
            messageId,
            groupId: message.groupId
        });

        res.status(200).json({ message: "消息已删除" });
    } catch (error) {
        console.error("删除群组消息失败:", error);
        res.status(500).json({ message: "删除群组消息失败" });
    }
};

// 清空群组聊天记录
export const clearGroupChatHistory = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "群组未找到" });
        }

        // 只有群主或管理员可以清空聊天记录
        const isAdmin = group.members.some(member =>
            member.user._id.toString() === userId.toString() && member.role === "admin"
        );
        const isCreator = group.createdBy.toString() === userId.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({ message: "无权清空群组聊天记录" });
        }

        // 删除群组的所有消息
        const result = await GroupMessage.deleteMany({ groupId });

        // 通知群组所有成员聊天记录已清空
        const io = getIO();
        io.to(`group_${groupId}`).emit("groupChatHistoryCleared", {
            groupId,
            clearedBy: userId,
            message: "群组聊天记录已清空"
        });

        res.status(200).json({
            message: "群组聊天记录已清空",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("清空群组聊天记录失败:", error);
        res.status(500).json({ message: "清空群组聊天记录失败" });
    }
};

// 获取群组成员列表
export const getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findOne({
            _id: groupId,
            "members.user": userId
        })
            .populate("members.user", "fullName email profilePic");

        if (!group) {
            return res.status(404).json({ message: "群组不存在或您不是群成员" });
        }

        res.status(200).json(group.members);
    } catch (error) {
        console.error("获取群组成员失败:", error);
        res.status(500).json({ message: "获取群组成员失败" });
    }
};
