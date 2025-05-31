import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getAvailableConcepts, generateCodeExample } from '../lib/codeGenerator.js';

const router = express.Router();

// 获取可用的 AI 概念列表
router.get('/concepts', protectRoute, async (req, res) => {
    try {
        const concepts = getAvailableConcepts();
        res.status(200).json({
            success: true,
            concepts
        });
    } catch (error) {
        console.error('获取 AI 概念列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取 AI 概念列表失败'
        });
    }
});

// 生成代码示例
router.post('/generate', protectRoute, async (req, res) => {
    try {
        const { conceptId, customPrompt } = req.body;

        if (!conceptId) {
            return res.status(400).json({
                success: false,
                error: '请选择 AI 概念'
            });
        }

        const result = await generateCodeExample(conceptId, customPrompt);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('生成代码示例失败:', error);
        res.status(500).json({
            success: false,
            error: '生成代码示例失败'
        });
    }
});

export default router; 