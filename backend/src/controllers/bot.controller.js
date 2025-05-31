import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import BotMessage from '../models/botMessage.model.js';
import BotConversation from '../models/botConversation.model.js';

// 导出对话记录
export const exportConversations = async (req, res) => {
    try {
        const {
            format: exportFormat = 'json',    // 导出格式：json/csv/pdf
            startDate,                        // 开始日期
            endDate,                          // 结束日期
            conversationId,                   // 特定会话ID
            includeMetadata = false           // 是否包含元数据
        } = req.query;

        const userId = req.user._id;
        console.log('开始导出对话记录:', { userId, exportFormat, startDate, endDate, conversationId, includeMetadata });

        // 构建查询条件
        const query = { userId };
        if (conversationId) {
            query.context = conversationId;
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                // 设置为当天的开始时间 00:00:00
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.createdAt.$gte = start;
            }
            if (endDate) {
                // 设置为当天的结束时间 23:59:59.999
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        console.log('查询条件:', query);

        // 获取对话数据
        const messages = await BotMessage.find(query)
            .sort({ createdAt: 1 })
            .populate('context', 'summary tags')
            .lean();

        console.log('查询到的消息数量:', messages.length);
        if (messages.length === 0) {
            console.log('没有找到任何消息记录');
        } else {
            console.log('第一条消息:', {
                id: messages[0]._id,
                type: messages[0].messageType,
                content: messages[0].content,
                context: messages[0].context
            });
        }

        // 按会话分组
        const conversations = messages.reduce((acc, message) => {
            const convId = message.context._id.toString();
            if (!acc[convId]) {
                acc[convId] = {
                    conversationId: convId,
                    summary: message.context.summary,
                    tags: message.context.tags,
                    messages: []
                };
            }

            // 根据includeMetadata决定是否包含元数据
            const messageData = {
                timestamp: message.createdAt,
                type: message.messageType,
                content: message.content
            };

            if (includeMetadata) {
                messageData.metadata = message.metadata;
            }

            acc[convId].messages.push(messageData);
            return acc;
        }, {});

        console.log('分组后的会话数量:', Object.keys(conversations).length);
        console.log('会话数据示例:', Object.values(conversations)[0]);

        // 根据格式导出
        switch (exportFormat.toLowerCase()) {
            case 'json':
                console.log('导出为JSON格式');
                return exportJSON(res, conversations);
            case 'csv':
                console.log('导出为CSV格式');
                return exportCSV(res, conversations);
            case 'pdf':
                console.log('导出为PDF格式');
                return exportPDF(res, conversations);
            default:
                console.log('不支持的导出格式:', exportFormat);
                return res.status(400).json({
                    error: '不支持的导出格式'
                });
        }
    } catch (error) {
        console.error('导出对话失败:', error);
        console.error('错误详情:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error: '导出对话失败',
            details: error.message
        });
    }
};

// JSON导出
const exportJSON = (res, data) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=bot-conversations.json');
    res.json(data);
};

// CSV导出
const exportCSV = (res, conversations) => {
    const fields = [
        'conversationId',
        'timestamp',
        'messageType',
        'content',
        'summary',
        'tags'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(Object.values(conversations).flatMap(conv =>
        conv.messages.map(msg => ({
            conversationId: conv.conversationId,
            timestamp: format(new Date(msg.timestamp), 'yyyy-MM-dd HH:mm:ss'),
            messageType: msg.type === 'user' ? '用户' : '机器人',
            content: msg.content.text || '',
            summary: conv.summary || '',
            tags: conv.tags.join(', ')
        }))
    ));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bot-conversations.csv');
    res.send(csv);
};

// PDF导出
const exportPDF = (res, conversations) => {
    const doc = new PDFDocument();

    // 设置响应头
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bot-conversations.pdf');

    // 将PDF流pipe到响应
    doc.pipe(res);

    // 遍历会话
    Object.values(conversations).forEach((conv, index) => {
        if (index > 0) {
            doc.addPage();
        }

        // 添加会话信息
        doc.fontSize(16).text('会话记录', { align: 'center' });
        doc.moveDown();

        if (conv.summary) {
            doc.fontSize(12).text(`摘要: ${conv.summary}`);
        }
        if (conv.tags.length > 0) {
            doc.fontSize(12).text(`标签: ${conv.tags.join(', ')}`);
        }
        doc.moveDown();

        // 添加消息记录
        conv.messages.forEach(msg => {
            const timestamp = format(new Date(msg.timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
            const type = msg.type === 'user' ? '用户' : '机器人';

            doc.fontSize(10)
                .text(`${timestamp} [${type}]`)
                .text(msg.content.text || '')
                .moveDown();
        });
    });

    // 完成PDF生成
    doc.end();
}; 