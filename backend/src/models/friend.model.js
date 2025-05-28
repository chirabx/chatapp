import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["sending", "accepted", "rejected"],
            default: "sending",
        },
        read: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// 删除所有现有索引
friendRequestSchema.indexes().forEach(index => {
    friendRequestSchema.index(index[0], { unique: false });
});

// 删除特定的旧索引
friendRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: false });

// 创建新的索引
friendRequestSchema.index(
    { sender: 1, receiver: 1 },
    {
        unique: true,
        partialFilterExpression: { status: "sending" }
    }
);

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

// 确保在模型创建后删除旧索引
FriendRequest.collection.dropIndexes().catch(err => {
    console.log("删除索引时出错:", err);
});

export default FriendRequest; 