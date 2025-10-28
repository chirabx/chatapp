import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import ImagePreview from "./ImagePreview";
import { compressImage, formatFileSize } from "../lib/imageUtils";
import EmojiPickerButton from "./EmojiPicker";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const fileInputRef = useRef(null);
    const textInputRef = useRef(null);
    const { sendMessage, isSendingMessage } = useChatStore();

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
            toast.error("请选择图片文件");
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
            setImagePreview(base64);
        } catch (error) {
            console.error("图片处理失败:", error);
            toast.error("图片处理失败，请重试");
        } finally {
            setIsCompressing(false);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleEmojiSelect = (emoji) => {
        if (!textInputRef.current) return;

        const input = textInputRef.current;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;

        // 在光标位置插入emoji
        const newText = text.slice(0, start) + emoji + text.slice(end);
        setText(newText);

        // 设置光标位置在emoji之后
        setTimeout(() => {
            const newPosition = start + emoji.length;
            input.setSelectionRange(newPosition, newPosition);
            input.focus();
        }, 0);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;

        try {
            await sendMessage({
                text: text.trim(),
                image: imagePreview,
            });

            // Clear form
            setText("");
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div className="p-4 w-full">
            {imagePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <ImagePreview
                            src={imagePreview}
                            alt="预览图片"
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                            flex items-center justify-center"
                            type="button"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        ref={textInputRef}
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                        placeholder="输入消息..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />
                    <button
                        type="button"
                        className="btn btn-circle"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCompressing || isSendingMessage}
                    >
                        {isCompressing ? (
                            <div className="loading loading-spinner loading-sm"></div>
                        ) : (
                            <Image size={20} />
                        )}
                    </button>
                    <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
                </div>
                <button
                    type="submit"
                    className="btn btn-circle"
                    disabled={(!text.trim() && !imagePreview) || isSendingMessage}
                >
                    {isSendingMessage ? (
                        <div className="loading loading-spinner loading-sm"></div>
                    ) : (
                        <Send size={20} />
                    )}
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
