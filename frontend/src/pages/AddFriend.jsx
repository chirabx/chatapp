import { useState } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const AddFriend = () => {
    const [email, setEmail] = useState("");
    const { sendFriendRequest, isLoading } = useFriendStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await sendFriendRequest(email);
            setEmail(""); // 只有在成功时才清空输入框
        } catch (error) {
            // 错误已经在 useFriendStore 中处理了
            // 这里可以添加额外的错误处理逻辑
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-base-200 rounded-lg shadow-xl">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-ghost btn-circle"
                    >
                        <IoArrowBack size={24} />
                    </button>
                    <h2 className="text-3xl font-bold text-base-content">添加好友</h2>
                    <div className="w-10"></div> {/* 占位元素，保持标题居中 */}
                </div>
                <p className="text-sm text-base-content/70 text-center">
                    输入好友的邮箱地址来发送好友请求
                </p>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-base-content">
                            邮箱地址
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 bg-base-100 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base-content"
                            placeholder="example@email.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full"
                    >
                        {isLoading ? "发送中..." : "发送好友请求"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddFriend; 