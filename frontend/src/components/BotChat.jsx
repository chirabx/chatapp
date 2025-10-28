import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { Send, X, Image as ImageIcon, Download, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios.js';
import { formatMessageTime } from '../lib/utils';
import BotExport from './BotExport';
import ImagePreview from './ImagePreview';
import { compressImage, formatFileSize } from '../lib/imageUtils';
import EmojiPickerButton from './EmojiPicker';

// 添加格式化消息内容的函数
const formatBotMessage = (text) => {
    if (!text) return '';

    // 将文本按换行符分割
    const lines = text.split('\n');

    // 处理每一行
    return lines.map((line, index) => {
        // 处理表情符号和特殊标记
        const formattedLine = line
            .replace(/【(.*?)】/g, '<strong class="text-primary">$1</strong>')
            .replace(/•/g, '• ')
            .replace(/(\d+\.)/g, '<span class="text-primary">$1</span>')
            .replace(/📌/g, '📌 ')
            .replace(/🌟/g, '🌟 ')
            .replace(/💡/g, '💡 ')
            .replace(/🎯/g, '🎯 ')
            .replace(/📝/g, '📝 ');

        // 根据行内容添加适当的样式类
        if (line.startsWith('【')) {
            return `<div class="font-bold text-lg mb-2">${formattedLine}</div>`;
        } else if (line.startsWith('•') || line.match(/^\d+\./)) {
            return `<div class="ml-4 mb-1">${formattedLine}</div>`;
        } else if (line.startsWith('📌')) {
            return `<div class="text-primary font-medium mb-1">${formattedLine}</div>`;
        } else if (line.trim() === '') {
            return '<div class="h-2"></div>'; // 添加空行间距
        } else {
            return `<div class="mb-1">${formattedLine}</div>`;
        }
    }).join('');
};

// 添加复制按钮组件
const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            // 移除HTML标签，只复制纯文本
            const plainText = text.replace(/<[^>]+>/g, '');
            await navigator.clipboard.writeText(plainText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // 2秒后恢复按钮状态
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute bottom-1 right-1 p-1 rounded-md hover:bg-base-300 transition-colors
                     opacity-0 group-hover:opacity-100"
            title="复制内容"
        >
            {copied ? (
                <Check className="size-4 text-success" />
            ) : (
                <Copy className="size-4 text-base-content/70" />
            )}
        </button>
    );
};

const BotChat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompressing, setIsCompressing] = useState(false);
    const messagesEndRef = useRef(null);
    const textInputRef = useRef(null);
    const { token, authUser } = useAuthStore();
    const { setSelectedUser } = useChatStore();

    // 加载历史消息
    const loadMessages = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/bot/messages');
            const botMessages = response.data;

            // 转换消息格式以匹配前端显示需求
            const formattedMessages = botMessages.map(msg => ({
                _id: msg._id,
                text: msg.content.text,
                image: msg.content.image,
                senderId: msg.messageType === 'user' ? authUser._id : 'bot',
                createdAt: msg.createdAt
            }));

            setMessages(formattedMessages);
        } catch (error) {
            console.error('加载历史消息失败:', error);
            toast.error('加载历史消息失败');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            toast.error('请选择图片文件');
            return;
        }

        // 检查文件大小（限制为 10MB）
        if (file.size > 10 * 1024 * 1024) {
            toast.error(`图片大小不能超过 10MB（当前: ${formatFileSize(file.size)}）`);
            return;
        }

        setIsCompressing(true);
        try {
            // 如果图片小于 2MB，直接读取，否则压缩
            let base64;
            if (file.size > 2 * 1024 * 1024) {
                base64 = await compressImage(file, {
                    maxWidth: 1920,
                    maxHeight: 1920,
                    quality: 0.8,
                    maxSizeMB: 2
                });
                // 估算压缩后的大小（base64字符串长度约等于原始文件大小的1.33倍）
                const estimatedSize = Math.round(base64.length * 0.75);
                toast.success(`图片已压缩（${formatFileSize(file.size)} → ${formatFileSize(estimatedSize)}）`);
            } else {
                const reader = new FileReader();
                base64 = await new Promise((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }
            setSelectedImage(base64);
        } catch (error) {
            console.error("图片处理失败:", error);
            toast.error('图片处理失败，请重试');
        } finally {
            setIsCompressing(false);
        }
    };

    const handleEmojiSelect = (emoji) => {
        if (!textInputRef.current) return;

        const input = textInputRef.current;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;

        // 在光标位置插入emoji
        const newText = inputMessage.slice(0, start) + emoji + inputMessage.slice(end);
        setInputMessage(newText);

        // 设置光标位置在emoji之后
        setTimeout(() => {
            const newPosition = start + emoji.length;
            input.setSelectionRange(newPosition, newPosition);
            input.focus();
        }, 0);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() && !selectedImage) return;

        // 保存当前消息内容
        const currentMessage = inputMessage.trim();
        const currentImage = selectedImage;

        // 立即更新UI，添加用户消息
        const userMessage = {
            _id: Date.now().toString(),
            text: currentMessage,
            image: currentImage,
            senderId: authUser._id,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        // 立即清空输入框和图片预览
        setInputMessage('');
        setSelectedImage(null);
        const fileInput = document.getElementById('bot-image-input');
        if (fileInput) {
            fileInput.value = '';
        }

        // 滚动到底部
        scrollToBottom();

        try {
            // 发送请求到服务器
            const response = await axiosInstance.post('/bot/message', {
                message: currentMessage,
                image: currentImage
            });

            if (response.data.success) {
                // 添加机器人响应
                const botMessage = {
                    _id: (Date.now() + 1).toString(),
                    text: response.data.response,
                    senderId: 'bot',
                    createdAt: new Date().toISOString()
                };
                setMessages(prev => [...prev, botMessage]);
                scrollToBottom();
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            // 发送失败时，移除用户消息
            setMessages(prev => prev.filter(msg => msg._id !== userMessage._id));

            if (error.response?.status === 413) {
                toast.error('图片太大，请尝试压缩后再上传');
            } else {
                toast.error(error.response?.data?.error || '发送消息失败');
            }
        }
    };

    // 在组件卸载时清理
    useEffect(() => {
        return () => {
            setSelectedImage(null);
            setInputMessage('');
            const fileInput = document.getElementById('bot-image-input');
            if (fileInput) {
                fileInput.value = '';
            }
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                {/* 聊天头部 */}
                <div className="p-2.5 border-b border-base-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="avatar">
                                <div className="size-10 rounded-full relative">
                                    <img src="/avatar.png" alt="ChiraBot" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium">ChiraBot</h3>
                                <p className="text-sm text-base-content/70">AI 助手</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 加载中的消息骨架屏 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {Array(6).fill(null).map((_, idx) => (
                        <div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
                            <div className="chat-image avatar">
                                <div className="size-10 rounded-full">
                                    <div className="skeleton w-full h-full rounded-full" />
                                </div>
                            </div>
                            <div className="chat-header mb-1">
                                <div className="skeleton h-4 w-16" />
                            </div>
                            <div className="chat-bubble bg-transparent p-0">
                                <div className="skeleton h-16 w-[200px]" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* 输入框 - 正常显示 */}
                <form onSubmit={handleSendMessage} className="p-4 w-full" autoComplete="off">
                    {selectedImage && (
                        <div className="mb-3 flex items-center gap-2">
                            <div className="relative">
                                <ImagePreview
                                    src={selectedImage}
                                    alt="预览图片"
                                    className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                                    flex items-center justify-center"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                ref={textInputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="输入消息..."
                                className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                name="bot-message"
                                id="bot-message-input"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="bot-image-input"
                                onChange={handleImageSelect}
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                className="btn btn-circle"
                                onClick={() => document.getElementById('bot-image-input').click()}
                                disabled={isCompressing}
                            >
                                {isCompressing ? (
                                    <div className="loading loading-spinner loading-sm"></div>
                                ) : (
                                    <ImageIcon size={20} />
                                )}
                            </button>
                            <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-circle"
                            disabled={!inputMessage.trim() && !selectedImage}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            {/* 聊天头部 */}
            <div className="p-2.5 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* 机器人头像 */}
                        <div className="avatar">
                            <div className="size-10 rounded-full relative">
                                <img src="/avatar.png" alt="ChiraBot" />
                            </div>
                        </div>

                        {/* 机器人信息 */}
                        <div>
                            <h3 className="font-medium">ChiraBot</h3>
                            <p className="text-sm text-base-content/70">AI 助手</p>
                        </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2">
                        {/* 导出按钮 */}
                        <button
                            onClick={() => setIsExportOpen(true)}
                            className="btn btn-ghost btn-circle btn-sm"
                            title="导出对话记录"
                        >
                            <Download size={20} />
                        </button>
                        {/* 关闭按钮 */}
                        <button onClick={() => setSelectedUser(null)}>
                            <X />
                        </button>
                    </div>
                </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                    >
                        <div className="chat-image avatar">
                            <div className="size-10 rounded-full border">
                                <img
                                    src={
                                        message.senderId === authUser._id
                                            ? authUser.profilePic || "/avatar.png"
                                            : "/avatar.png"
                                    }
                                    alt="profile pic"
                                />
                            </div>
                        </div>
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1">
                                {formatMessageTime(message.createdAt)}
                            </time>
                        </div>
                        <div className={`chat-bubble group relative ${message.senderId === 'bot' ? 'whitespace-pre-wrap' : ''}`}>
                            {message.image && (
                                <ImagePreview
                                    src={message.image}
                                    alt="消息图片"
                                    className="sm:max-w-[200px] rounded-md mb-2"
                                />
                            )}
                            {message.text && (
                                message.senderId === 'bot' ? (
                                    <>
                                        <div
                                            className="prose prose-sm max-w-none pr-8"
                                            dangerouslySetInnerHTML={{
                                                __html: formatBotMessage(message.text)
                                            }}
                                        />
                                        <CopyButton text={message.text} />
                                    </>
                                ) : (
                                    <p>{message.text}</p>
                                )
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* 导出弹窗 */}
            <BotExport
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
            />

            {/* 输入框 */}
            <form onSubmit={handleSendMessage} className="p-4 w-full" autoComplete="off">
                {selectedImage && (
                    <div className="mb-3 flex items-center gap-2">
                        <div className="relative">
                            <ImagePreview
                                src={selectedImage}
                                alt="预览图片"
                                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                            />
                            <button
                                type="button"
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                                flex items-center justify-center"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            ref={textInputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="输入消息..."
                            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            name="bot-message"
                            id="bot-message-input"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="bot-image-input"
                            onChange={handleImageSelect}
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            className="btn btn-circle"
                            onClick={() => document.getElementById('bot-image-input').click()}
                            disabled={isCompressing}
                        >
                            {isCompressing ? (
                                <div className="loading loading-spinner loading-sm"></div>
                            ) : (
                                <ImageIcon size={20} />
                            )}
                        </button>
                        <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-circle"
                        disabled={!inputMessage.trim() && !selectedImage}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BotChat; 