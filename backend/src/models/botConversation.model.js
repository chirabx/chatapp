import mongoose from "mongoose";

const botConversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "archived"],
        default: "active"
    },
    summary: {
        type: String,        // 会话摘要
        default: ""
    },
    tags: [{                 // 会话标签，用于分类和检索
        type: String
    }],
    lastInteraction: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

botConversationSchema.index({ userId: 1, lastInteraction: -1 });
botConversationSchema.index({ status: 1, lastInteraction: -1 });

const BotConversation = mongoose.model("BotConversation", botConversationSchema);

export default BotConversation; 