import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        maxlength: 1000
    },
    image: {
        type: String
    },
    messageType: {
        type: String,
        enum: ["text", "image", "system"],
        default: "text"
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupMessage"
    }
}, { timestamps: true });

// 添加索引
groupMessageSchema.index({ groupId: 1, createdAt: -1 });
groupMessageSchema.index({ senderId: 1 });
groupMessageSchema.index({ groupId: 1, messageType: 1 });

const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);

export default GroupMessage;
