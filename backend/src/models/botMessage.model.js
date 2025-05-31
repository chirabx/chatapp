import mongoose from "mongoose";

const botMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    messageType: {
        type: String,
        enum: ["user", "bot"],
        required: true,
    },
    content: {
        text: {
            type: String,
            default: ''
        },
        image: {
            type: String,
            default: null
        },
        imageAnalysis: {
            type: mongoose.Schema.Types.Mixed, // 使用 Mixed 类型以支持任意格式的图片分析结果
            default: null
        }
    },
    context: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BotConversation",
        required: true,
    },
    metadata: {
        intent: String,        // 用户意图识别结果
        confidence: Number,    // 意图识别的置信度
        entities: [{          // 实体识别结果
            type: String,     // 实体类型
            value: String,    // 实体值
            start: Number,    // 在文本中的起始位置
            end: Number       // 在文本中的结束位置
        }]
    }
}, { timestamps: true });

// 创建索引
botMessageSchema.index({ context: 1, createdAt: -1 });
botMessageSchema.index({ userId: 1, createdAt: -1 });

const BotMessage = mongoose.model("BotMessage", botMessageSchema);

export default BotMessage; 