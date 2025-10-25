import { useRef, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import LazyImage from "./LazyImage";

const GroupMessageInput = ({ groupId }) => {
    const [messageText, setMessageText] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const { sendGroupMessage, isSendingMessage } = useGroupStore();
    const { authUser } = useAuthStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
            toast.error("请选择图片文件");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() && !image) return;

        try {
            await sendGroupMessage(groupId, {
                text: messageText.trim(),
                image: image
            }, authUser);
            setMessageText("");
            setImage(null);
            setImagePreview(null);
        } catch (error) {
            // 错误已在store中处理
        }
    };

    return (
        <div className="border-t border-base-300 p-2 sm:p-4 bg-base-100">
            {imagePreview && (
                <div className="mb-3 relative">
                    <LazyImage
                        src={imagePreview}
                        alt="预览"
                        className="max-w-xs rounded-lg"
                    />
                    <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 btn btn-sm btn-circle btn-error"
                    >
                        ×
                    </button>
                </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-1 sm:gap-2">
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="输入消息..."
                    className="input input-bordered flex-1 text-sm sm:text-base"
                    disabled={isSendingMessage}
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                />
                <div className="flex gap-1 sm:gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-ghost btn-sm sm:btn-md p-1 sm:p-2"
                        title="发送图片"
                        disabled={isSendingMessage}
                    >
                        <Image className="size-4 sm:size-5" />
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary btn-sm sm:btn-md p-1 sm:p-2"
                        disabled={(!messageText.trim() && !image) || isSendingMessage}
                    >
                        {isSendingMessage ? (
                            <div className="loading loading-spinner loading-sm"></div>
                        ) : (
                            <Send className="size-4 sm:size-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GroupMessageInput;
