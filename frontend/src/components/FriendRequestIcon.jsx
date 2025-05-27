import { useState, useEffect, useRef } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import { IoPersonAdd } from "react-icons/io5";
import { IoCheckmark, IoClose } from "react-icons/io5";
import { toast } from "react-hot-toast";

const FriendRequestIcon = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { friendRequests, fetchFriendRequests, respondToFriendRequest, unreadRequests, markRequestsAsRead } = useFriendStore();
    const { authUser } = useAuthStore();
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchFriendRequests();
    }, [fetchFriendRequests]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleOpen = async () => {
        if (!isOpen) {
            await markRequestsAsRead();
        }
        setIsOpen(!isOpen);
    };

    const handleRespond = async (requestId, status) => {
        if (!requestId) {
            toast.error("无效的请求ID");
            return;
        }
        try {
            await respondToFriendRequest(requestId, status);
            if (friendRequests.length === 1) {
                setIsOpen(false);
            }
        } catch (error) {
            console.error("处理好友请求失败:", error);
        }
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleOpen}
                className="relative p-2 text-base-content/70 hover:text-base-content"
            >
                <IoPersonAdd size={24} className="hover:scale-110 transition-transform duration-200" />
                {unreadRequests > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-error-content text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                        {unreadRequests}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed sm:absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-base-200 rounded-lg shadow-xl p-4 z-50 border border-base-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-base-content">好友请求</h3>
                        <span className="text-sm text-base-content/70">
                            {friendRequests.length} 个请求
                        </span>
                    </div>

                    {friendRequests.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-base-content/70">暂无好友请求</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
                            {friendRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="flex items-center justify-between p-3 bg-base-100 rounded-lg hover:bg-base-300"
                                >
                                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                                        {request.sender.profilePic ? (
                                            <img
                                                src={request.sender.profilePic}
                                                alt={request.sender.fullName}
                                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-medium flex-shrink-0">
                                                {getInitials(request.sender.fullName)}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-base-content truncate">
                                                {request.sender.fullName || request.sender.email}
                                            </p>
                                            <p className="text-xs text-base-content/70 truncate">
                                                {request.sender.email}
                                            </p>
                                            <p className="text-xs text-base-content/50">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 ml-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleRespond(request._id, "accepted")}
                                            className="p-2 text-success hover:bg-success/20 rounded-full"
                                            title="接受"
                                        >
                                            <IoCheckmark size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleRespond(request._id, "rejected")}
                                            className="p-2 text-error hover:bg-error/20 rounded-full"
                                            title="拒绝"
                                        >
                                            <IoClose size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FriendRequestIcon; 