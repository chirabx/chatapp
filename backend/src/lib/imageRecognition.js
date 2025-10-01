import axios from 'axios';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

// API 配置
const API_CONFIG = {
    baseURL: 'https://api.qhaigc.net/v1/chat/completions',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000 // 30秒超时
};

// 创建 axios 实例
const apiClient = axios.create(API_CONFIG);

/**
 * 压缩图片数据
 * @param {string} base64Data - base64编码的图片数据
 * @returns {Promise<string>} 压缩后的base64数据
 */
const compressImage = async (base64Data) => {
    try {
        // 将 base64 转换为 Buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // 使用 sharp 压缩图片
        const compressedBuffer = await sharp(buffer)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({
                quality: 60,
                progressive: true
            })
            .toBuffer();

        // 转回 base64
        return compressedBuffer.toString('base64');
    } catch (error) {
        console.error('图片压缩失败:', error);
        throw error;
    }
};

/**
 * 分析图片内容
 * @param {string} imageBase64 - base64编码的图片数据
 * @param {string} prompt - 用户提示词
 * @returns {Promise<Object>} 分析结果
 */
export const analyzeImage = async (imageBase64, prompt = '请描述这张图片的内容') => {
    console.log('开始图像识别...');
    console.log('API Key 是否存在:', !!process.env.IMAGE_API_KEY);

    if (!process.env.IMAGE_API_KEY) {
        throw new Error('未配置图片识别API密钥');
    }

    try {
        // 处理图片数据
        let base64Data = imageBase64.includes('base64,')
            ? imageBase64.split('base64,')[1]
            : imageBase64;

        console.log('原始图片数据长度:', base64Data.length);

        // 压缩图片
        try {
            base64Data = await compressImage(base64Data);
            console.log('压缩后图片数据长度:', base64Data.length);
        } catch (compressError) {
            console.warn('图片压缩失败，使用原始图片:', compressError);
        }

        // 构建请求数据
        const requestData = {
            model: "claude-3-7-sonnet-20250219",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt + "\n\n请严格按照以下JSON格式返回，不要添加任何其他文字说明：\n{\n  \"label\": \"主要识别结果\",\n  \"confidence\": 0.9,\n  \"alternatives\": [\n    {\"label\": \"备选答案1\", \"confidence\": 0.1},\n    {\"label\": \"备选答案2\", \"confidence\": 0.05}\n  ]\n}"
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Data}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 300,
            temperature: 0.7
        };

        console.log('发送API请求...');
        // 发送请求
        const response = await apiClient.post('', requestData, {
            headers: {
                'Authorization': `Bearer ${process.env.IMAGE_API_KEY}`
            }
        });

        console.log('API响应:', response.data);

        // 验证响应
        if (!response.data?.choices?.[0]?.message?.content) {
            throw new Error('API返回数据格式无效');
        }

        // 返回处理后的结果
        return {
            success: true,
            content: response.data.choices[0].message.content,
            usage: response.data.usage,
            model: response.data.model
        };

    } catch (error) {
        // 详细的错误处理
        console.error('API错误详情:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });

        const errorMessage = error.response?.data?.error?.message
            || error.message
            || '图片识别失败';

        const errorDetails = {
            message: errorMessage,
            status: error.response?.status,
            requestId: error.response?.data?.error?.request_id,
            type: error.response?.data?.error?.type
        };

        console.error('图片识别错误:', errorDetails);

        // 根据错误类型返回不同的错误信息
        if (error.response?.status === 401) {
            throw new Error('API密钥无效或已过期');
        } else if (error.response?.status === 429) {
            throw new Error('API调用次数超限');
        } else if (error.response?.status === 413) {
            throw new Error('图片大小超出限制');
        } else if (error.response?.status === 504) {
            throw new Error('请求超时，请稍后重试');
        } else {
            throw new Error(`图片识别失败: ${errorMessage}`);
        }
    }
}; 