import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { analyzeImage } from '../lib/imageRecognition.js';

const router = express.Router();

// 图像识别游戏接口
router.post('/image-recognition', protectRoute, async (req, res) => {
    try {
        const { image } = req.body;
        const userId = req.user._id;

        if (!image) {
            return res.status(400).json({
                success: false,
                error: '图片数据不能为空'
            });
        }

        // 使用专门的提示词进行图像识别
        const prompt = '请识别这张图片中的物体或图案，并以JSON格式返回结果，包含以下字段：label（主要识别结果）、confidence（置信度，0-1之间的小数）、alternatives（其他可能的答案数组，每个答案包含label和confidence）。例如：{"label": "猫", "confidence": 0.89, "alternatives": [{"label": "狗", "confidence": 0.08}, {"label": "兔子", "confidence": 0.03}]}。请确保返回的是合法的JSON格式。';

        // 调用图像识别API
        const analysisResult = await analyzeImage(image, prompt);

        if (!analysisResult.success) {
            throw new Error('图像识别失败');
        }

        // 解析返回的JSON字符串
        try {
            // 尝试从文本中提取JSON部分
            const content = analysisResult.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                throw new Error('无法从响应中提取JSON数据');
            }

            const prediction = JSON.parse(jsonMatch[0]);

            // 验证返回的数据格式
            if (!prediction.label || typeof prediction.confidence !== 'number' || !Array.isArray(prediction.alternatives)) {
                throw new Error('API返回数据格式无效');
            }

            res.status(200).json({
                success: true,
                prediction,
                model: analysisResult.model,
                usage: analysisResult.usage
            });
        } catch (parseError) {
            console.error('解析识别结果失败:', parseError);
            // 如果解析失败，尝试构造一个基本的结果
            const content = analysisResult.content;
            const prediction = {
                label: content.split('。')[0].replace('根据图像，', '').trim(),
                confidence: 0.8,
                alternatives: []
            };

            res.status(200).json({
                success: true,
                prediction,
                model: analysisResult.model,
                usage: analysisResult.usage
            });
        }
    } catch (error) {
        console.error('图像识别游戏错误:', error);
        res.status(500).json({
            success: false,
            error: error.message || '图像识别失败'
        });
    }
});

export default router; 