import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { generateResponse } from '../lib/deepseek.js';
import { analyzeImage } from '../lib/imageRecognition.js';
import { exportConversations } from "../controllers/bot.controller.js";
import BotMessage from '../models/botMessage.model.js';
import BotConversation from '../models/botConversation.model.js';
import cloudinary from '../lib/cloudinary.js';

const router = express.Router();

// 获取或创建会话
const getOrCreateConversation = async (userId) => {
    // 查找用户最新的活跃会话
    let conversation = await BotConversation.findOne({
        userId,
        status: 'active'
    }).sort({ lastInteraction: -1 });

    // 如果没有活跃会话，创建一个新的
    if (!conversation) {
        conversation = new BotConversation({
            userId,
            status: 'active',
            summary: '新会话',
            tags: ['general']
        });
        await conversation.save();
    }

    return conversation;
};

// 简单的回复逻辑
const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return '你好！我是 ChiraBot，很高兴为你服务！';
    }

    if (lowerMessage.includes('help')) {
        return '我可以帮你：\n1. 回答简单问题\n2. 提供聊天服务\n3. 分享有趣的知识';
    }

    if (lowerMessage.includes('weather')) {
        return '抱歉，我还不能查询天气信息。';
    }

    if (lowerMessage.includes('time')) {
        return `现在的时间是：${new Date().toLocaleTimeString()}`;
    }

    return '抱歉，我还在学习中，不太明白你的意思。你可以试试问我一些简单的问题！';
};

// 处理机器人消息的路由
router.post('/message', protectRoute, async (req, res) => {
    try {
        const { message, image } = req.body;
        const userId = req.user._id;

        console.log('收到机器人消息请求:', { userId, message, hasImage: !!image });

        if (!message && !image) {
            return res.status(400).json({
                success: false,
                error: '消息不能为空'
            });
        }

        // 获取或创建会话
        const conversation = await getOrCreateConversation(userId);
        console.log('获取/创建会话成功:', { conversationId: conversation._id });

        // 处理图片上传和分析
        let imageUrl;
        let imageAnalysis = null;
        if (image) {
            console.log('开始上传图片...');
            try {
                const uploadResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadResponse.secure_url;
                console.log('图片上传成功:', imageUrl);

                // 进行图片识别
                console.log('开始图片识别...');
                const prompt = message || '请详细描述这张图片的内容，并解释其中可能涉及的信息科技知识';
                const analysisResult = await analyzeImage(image, prompt);

                if (analysisResult.success) {
                    imageAnalysis = {
                        content: analysisResult.content,
                        model: analysisResult.model,
                        usage: analysisResult.usage
                    };
                    console.log('图片识别成功:', imageAnalysis);
                } else {
                    throw new Error('图片识别返回失败');
                }
            } catch (error) {
                console.error('图片处理失败:', error);
                return res.status(500).json({
                    success: false,
                    error: '图片处理失败',
                    details: error.message
                });
            }
        }

        // 存储用户消息
        console.log('开始存储用户消息...');
        const userMessage = new BotMessage({
            userId,
            messageType: 'user',
            content: {
                text: message,
                image: imageUrl,
                imageAnalysis: imageAnalysis
            },
            context: conversation._id,
            metadata: {
                intent: image ? 'image_analysis' : 'text_message',
                confidence: imageAnalysis ? 1 : null,
                model: imageAnalysis?.model
            }
        });
        await userMessage.save();
        console.log('用户消息存储成功:', { messageId: userMessage._id });

        // 生成机器人响应
        console.log('开始生成机器人响应...');
        let response;
        if (image && imageAnalysis) {
            // 如果有图片分析结果，构建更自然的对话
            const combinedMessage = `用户发送了一张图片，并${message ? '询问：' + message : '希望了解图片内容'}。\n\n图片分析结果：${imageAnalysis.content}\n\n请根据以上信息，用轻松友好的语气回答用户，并适当补充相关的信息科技知识。`;
            response = await generateResponse(combinedMessage);
        } else {
            response = await generateResponse(message);
        }
        console.log('机器人响应生成成功');

        // 存储机器人消息
        console.log('开始存储机器人消息...');
        const botMessage = new BotMessage({
            userId,
            messageType: 'bot',
            content: {
                text: response,
                imageAnalysis: imageAnalysis
            },
            context: conversation._id,
            metadata: {
                intent: image ? 'image_response' : 'text_response',
                confidence: 1,
                model: imageAnalysis?.model
            }
        });
        await botMessage.save();
        console.log('机器人消息存储成功:', { messageId: botMessage._id });
        console.log('更新会话最后交互时间...');
        conversation.lastInteraction = new Date();
        await conversation.save();
        console.log('会话更新成功');

        res.status(200).json({
            success: true,
            response,
            imageAnalysis,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('机器人消息处理错误:', error);
        console.error('错误详情:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            error: '处理消息时出错',
            details: error.message
        });
    }
});

// 获取历史消息
router.get('/messages', protectRoute, async (req, res) => {
    try {
        const userId = req.user._id;
        const { conversationId } = req.query;

        const query = { userId };
        if (conversationId) {
            query.context = conversationId;
        }

        const messages = await BotMessage.find(query)
            .sort({ createdAt: 1 })
            .populate('context', 'summary tags');

        res.status(200).json(messages);
    } catch (error) {
        console.error('获取历史消息失败:', error);
        res.status(500).json({
            success: false,
            error: '获取历史消息失败'
        });
    }
});

// 获取会话列表
router.get('/conversations', protectRoute, async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await BotConversation.find({ userId })
            .sort({ lastInteraction: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        console.error('获取会话列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取会话列表失败'
        });
    }
});

// 导出路由
router.get('/export', protectRoute, exportConversations);

export default router; 