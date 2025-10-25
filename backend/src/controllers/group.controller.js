import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import { getIO } from "../lib/socket.js";

// 创建群组
export const createGroup = async (req, res) => {
    try {
        const { name, description, avatar } = req.body;
        const createdBy = req.user._id;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: "群组名称不能为空" });
        }

        if (name.length > 50) {
            return res.status(400).json({ message: "群组名称不能超过50个字符" });
        }

        // 创建群组
        const newGroup = new Group({
            name: name.trim(),
            description: description?.trim() || "",
            avatar: avatar || "",
            createdBy,
            members: [{
                user: createdBy,
                role: "admin",
                joinedAt: new Date()
            }]
        });

        await newGroup.save();

        // 填充创建者信息
        await newGroup.populate("createdBy", "fullName email profilePic");
        await newGroup.populate("members.user", "fullName email profilePic");

        // 通知创建者
        const io = getIO();
        io.to(createdBy.toString()).emit("groupCreated", newGroup);

        res.status(201).json(newGroup);
    } catch (error) {
        console.error("创建群组失败:", error);
        res.status(500).json({ message: "创建群组失败" });
    }
};

// 获取用户的群组列表
export const getGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await Group.find({
            "members.user": userId
        })
            .populate("createdBy", "fullName email profilePic")
            .populate("members.user", "fullName email profilePic")
            .sort({ updatedAt: -1 });

        res.status(200).json(groups);
    } catch (error) {
        console.error("获取群组列表失败:", error);
        res.status(500).json({ message: "获取群组列表失败" });
    }
};

// 获取群组详情
export const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findOne({
            _id: groupId,
            "members.user": userId
        })
            .populate("createdBy", "fullName email profilePic")
            .populate("members.user", "fullName email profilePic");

        if (!group) {
            return res.status(404).json({ message: "群组不存在或您不是群成员" });
        }

        res.status(200).json(group);
    } catch (error) {
        console.error("获取群组详情失败:", error);
        res.status(500).json({ message: "获取群组详情失败" });
    }
};

// 更新群组信息
export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, description, avatar } = req.body;
        const userId = req.user._id;

        const group = await Group.findOne({
            _id: groupId,
            "members.user": userId,
            "members.role": "admin"
        });

        if (!group) {
            return res.status(404).json({ message: "群组不存在或您没有管理权限" });
        }

        if (name && name.trim().length > 0) {
            group.name = name.trim();
        }
        if (description !== undefined) {
            group.description = description.trim();
        }
        if (avatar !== undefined) {
            group.avatar = avatar;
        }

        await group.save();
        await group.populate("createdBy", "fullName email profilePic");
        await group.populate("members.user", "fullName email profilePic");

        // 通知所有群成员
        const io = getIO();
        group.members.forEach(member => {
            io.to(member.user._id.toString()).emit("groupUpdated", group);
        });

        res.status(200).json(group);
    } catch (error) {
        console.error("更新群组失败:", error);
        res.status(500).json({ message: "更新群组失败" });
    }
};

// 添加群成员
export const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { email, userId: userIdToAdd } = req.body;
        const currentUserId = req.user._id;

        if (!email && !userIdToAdd) {
            return res.status(400).json({ message: "邮箱或用户ID不能为空" });
        }

        let userToAdd;
        if (email) {
            // 通过邮箱查找用户
            userToAdd = await User.findOne({ email });
            if (!userToAdd) {
                return res.status(404).json({ message: "用户不存在" });
            }
        } else {
            // 通过用户ID查找用户
            userToAdd = await User.findById(userIdToAdd);
            if (!userToAdd) {
                return res.status(404).json({ message: "用户不存在" });
            }
        }

        // 检查群组是否存在
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "群组不存在" });
        }

        // 检查当前用户是否有管理权限
        const isAdmin = group.members.some(member =>
            member.user._id.toString() === currentUserId.toString() && member.role === "admin"
        );
        const isCreator = group.createdBy.toString() === currentUserId.toString();

        if (!isAdmin && !isCreator) {
            return res.status(403).json({ message: "您没有管理权限" });
        }

        // 检查用户是否已经是群成员
        const isAlreadyMember = group.members.some(
            member => member.user.toString() === userToAdd._id.toString()
        );

        if (isAlreadyMember) {
            return res.status(400).json({ message: "用户已经是群成员" });
        }

        // 检查群组是否已满
        if (group.members.length >= group.settings.maxMembers) {
            return res.status(400).json({ message: "群组已满" });
        }

        // 添加成员
        group.members.push({
            user: userToAdd._id,
            role: "member",
            joinedAt: new Date()
        });

        await group.save();
        await group.populate("createdBy", "fullName email profilePic");
        await group.populate("members.user", "fullName email profilePic");

        // 通知所有群成员
        const io = getIO();
        group.members.forEach(member => {
            io.to(member.user._id.toString()).emit("groupMemberAdded", {
                group: group,
                newMember: userToAdd
            });
        });

        res.status(200).json(group);
    } catch (error) {
        console.error("添加群成员失败:", error);
        res.status(500).json({ message: "添加群成员失败" });
    }
};

// 移除群成员
export const removeMember = async (req, res) => {
    try {
        const { groupId, memberId } = req.params;
        const userId = req.user._id;

        const group = await Group.findOne({
            _id: groupId,
            "members.user": userId,
            "members.role": "admin"
        });

        if (!group) {
            return res.status(404).json({ message: "群组不存在或您没有管理权限" });
        }

        // 查找要移除的成员
        const memberToRemove = group.members.find(
            member => member.user.toString() === memberId
        );

        if (!memberToRemove) {
            return res.status(404).json({ message: "成员不存在" });
        }

        // 不能移除群主
        if (memberToRemove.role === "admin" && group.createdBy.toString() === memberId) {
            return res.status(400).json({ message: "不能移除群主" });
        }

        // 移除成员
        group.members = group.members.filter(
            member => member.user.toString() !== memberId
        );

        await group.save();
        await group.populate("createdBy", "fullName email profilePic");
        await group.populate("members.user", "fullName email profilePic");

        // 通知所有群成员
        const io = getIO();
        group.members.forEach(member => {
            io.to(member.user._id.toString()).emit("groupMemberRemoved", {
                group: group,
                removedMemberId: memberId
            });
        });

        // 通知被移除的用户
        io.to(memberId).emit("removedFromGroup", {
            groupId: groupId,
            groupName: group.name
        });

        res.status(200).json(group);
    } catch (error) {
        console.error("移除群成员失败:", error);
        res.status(500).json({ message: "移除群成员失败" });
    }
};

// 退出群组
export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findOne({
            _id: groupId,
            "members.user": userId
        });

        if (!group) {
            return res.status(404).json({ message: "群组不存在或您不是群成员" });
        }

        // 群主不能退出群组，只能删除群组
        if (group.createdBy.toString() === userId) {
            return res.status(400).json({ message: "群主不能退出群组，请删除群组" });
        }

        // 移除用户
        group.members = group.members.filter(
            member => member.user.toString() !== userId
        );

        await group.save();
        await group.populate("createdBy", "fullName email profilePic");
        await group.populate("members.user", "fullName email profilePic");

        // 通知其他群成员
        const io = getIO();
        group.members.forEach(member => {
            io.to(member.user._id.toString()).emit("groupMemberLeft", {
                group: group,
                leftMemberId: userId
            });
        });

        res.status(200).json({ message: "已退出群组" });
    } catch (error) {
        console.error("退出群组失败:", error);
        res.status(500).json({ message: "退出群组失败" });
    }
};

// 删除群组
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        const group = await Group.findOne({
            _id: groupId,
            createdBy: userId
        });

        if (!group) {
            return res.status(404).json({ message: "群组不存在或您不是群主" });
        }

        // 通知所有群成员
        const io = getIO();
        group.members.forEach(member => {
            io.to(member.user._id.toString()).emit("groupDeleted", {
                groupId: groupId,
                groupName: group.name
            });
        });

        await Group.findByIdAndDelete(groupId);

        res.status(200).json({ message: "群组已删除" });
    } catch (error) {
        console.error("删除群组失败:", error);
        res.status(500).json({ message: "删除群组失败" });
    }
};
