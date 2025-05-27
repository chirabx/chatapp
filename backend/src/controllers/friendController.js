try {
    // 删除好友关系
    await Friend.deleteOne({
        $or: [
            { user: req.user._id, friend: friendId },
            { user: friendId, friend: req.user._id }
        ]
    });

    // 获取被删除的好友信息
    const removedFriend = await User.findById(friendId).select('_id email');

    // 发送 Socket.IO 事件通知被删除的好友
    const io = req.app.get('io');
    io.to(friendId.toString()).emit('friendRemoved', {
        userId: req.user._id,
        message: 'A friend has removed you from their list'
    });

    res.json({ message: 'Friend removed successfully' });
} catch (error) {
    res.status(500).json({ error: 'Failed to remove friend' });
}

try {
    const friendRequest = await FriendRequest.create({
        sender: req.user._id,
        receiver: receiver._id,
        read: false
    });

    // 获取在线用户列表
    const io = req.app.get('io');
    const onlineUsers = Array.from(io.sockets.adapter.rooms.get('online') || []);

    // 检查接收者是否在线
    const isReceiverOnline = onlineUsers.includes(receiver._id.toString());

    if (isReceiverOnline) {
        // 如果接收者在线，发送实时通知
        io.to(receiver._id.toString()).emit('newFriendRequest', {
            _id: friendRequest._id,
            sender: {
                _id: req.user._id,
                email: req.user.email
            },
            receiver: receiver._id,
            status: 'pending',
            createdAt: friendRequest.createdAt,
            read: false
        });
    }

    res.json({ message: 'Friend request sent successfully' });
} catch (error) {
    res.status(500).json({ error: 'Failed to send friend request' });
}

// 标记好友请求为已读
exports.markRequestsAsRead = async (req, res) => {
    try {
        await FriendRequest.updateMany(
            { receiver: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.json({ message: 'Friend requests marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark friend requests as read' });
    }
}; 