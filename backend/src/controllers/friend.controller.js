import FriendRequest from "../models/friend.model.js";
import User from "../models/user.model.js";

export const sendFriendRequest = async (req, res) => {
    try {
        const { email } = req.body;
        const senderId = req.user._id;

        // 查找接收者
        const receiver = await User.findOne({ email });
        if (!receiver) {
            return res.status(404).json({ message: "未找到该用户" });
        }

        // 不能添加自己为好友
        if (receiver._id.toString() === senderId.toString()) {
            return res.status(400).json({ message: "不能添加自己为好友" });
        }

        // 检查是否已经是好友
        const existingFriendship = await FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiver._id },
                { sender: receiver._id, receiver: senderId }
            ],
            status: "accepted"
        });

        if (existingFriendship) {
            return res.status(400).json({ message: "已经是好友关系" });
        }

        // 检查是否已经存在待处理的好友请求
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiver._id },
                { sender: receiver._id, receiver: senderId }
            ],
            status: "sending"
        });

        if (existingRequest) {
            return res.status(400).json({ message: "已存在待处理的好友请求" });
        }

        // 如果存在已拒绝的请求，则更新状态为sending
        const rejectedRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiver._id,
            status: "rejected"
        });

        let friendRequest;
        if (rejectedRequest) {
            rejectedRequest.status = "sending";
            friendRequest = await rejectedRequest.save();
        } else {
            // 创建新的好友请求
            friendRequest = await FriendRequest.create({
                sender: senderId,
                receiver: receiver._id,
                status: "sending",
                read: false
            });
        }

        // 通过socket.io通知接收者
        const io = req.app.get("io");
        const receiverId = receiver._id.toString();

        // 发送好友请求通知
        io.to(receiverId).emit("newFriendRequest", {
            requestId: friendRequest._id,
            sender: {
                _id: req.user._id,
                email: req.user.email,
                fullName: req.user.fullName,
                profilePic: req.user.profilePic
            },
            status: "sending",
            createdAt: friendRequest.createdAt,
            read: false
        });

        res.status(201).json(friendRequest);
    } catch (error) {
        console.error("发送好友请求失败:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const requests = await FriendRequest.find({
            receiver: userId,
            status: "sending"
        }).populate("sender", "fullName email profilePic");

        // 格式化请求数据
        const formattedRequests = requests.map(request => ({
            _id: request._id,
            sender: {
                _id: request.sender._id,
                fullName: request.sender.fullName,
                email: request.sender.email,
                profilePic: request.sender.profilePic
            },
            status: request.status,
            read: request.read,
            createdAt: request.createdAt
        }));

        res.status(200).json(formattedRequests);
    } catch (error) {
        console.error("获取好友请求失败:", error);
        res.status(500).json({ message: error.message });
    }
};

export const respondToFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;
        const userId = req.user._id;

        if (!requestId) {
            return res.status(400).json({ message: "请求ID不能为空" });
        }

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "无效的状态值" });
        }

        const friendRequest = await FriendRequest.findOne({
            _id: requestId,
            receiver: userId,
            status: "sending"
        });

        if (!friendRequest) {
            return res.status(404).json({ message: "好友请求不存在或已被处理" });
        }

        friendRequest.status = status;
        await friendRequest.save();

        // 通知发送者请求状态更新
        req.app.get("io").to(friendRequest.sender.toString()).emit("friendRequestResponse", {
            requestId: friendRequest._id,
            status: status
        });

        res.status(200).json(friendRequest);
    } catch (error) {
        console.error("处理好友请求失败:", error);
        res.status(500).json({ message: error.message || "处理好友请求失败" });
    }
};

export const getFriends = async (req, res) => {
    try {
        const userId = req.user._id;

        // 查找所有已接受的好友请求
        const friendRequests = await FriendRequest.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ],
            status: "accepted"
        });

        // 获取好友ID列表
        const friendIds = friendRequests.map(request => {
            return request.sender.toString() === userId.toString()
                ? request.receiver
                : request.sender;
        });

        // 获取好友详细信息
        const friends = await User.find({ _id: { $in: friendIds } })
            .select("fullName email profilePic");

        res.status(200).json(friends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.user._id;

        // 删除双方的好友关系
        await FriendRequest.deleteMany({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId }
            ]
        });

        // 通知被删除的好友
        req.app.get("io").to(friendId).emit("friendRemoved", {
            userId: userId
        });

        res.status(200).json({ message: "Friend removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markRequestsAsRead = async (req, res) => {
    try {
        await FriendRequest.updateMany(
            { receiver: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ message: "Friend requests marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 