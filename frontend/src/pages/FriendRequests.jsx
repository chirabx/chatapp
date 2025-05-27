import { useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import { IoCheckmark, IoClose } from "react-icons/io5";

const FriendRequests = () => {
    const { friendRequests, fetchFriendRequests, respondToFriendRequest } = useFriendStore();
    const { authUser } = useAuthStore();

    useEffect(() => {
        fetchFriendRequests();
    }, [fetchFriendRequests]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-base-200 rounded-lg shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-base-content">好友请求</h1>
                        <span className="text-base-content/70">
                            {friendRequests.length} 个请求
                        </span>
                    </div>

                    {friendRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-base-content/70 text-lg">暂无好友请求</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {friendRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="flex items-center justify-between p-4 bg-base-100 rounded-lg hover:bg-base-300 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-xl font-medium">
                                            {request.sender.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-base font-medium text-base-content">
                                                {request.sender.email}
                                            </p>
                                            <p className="text-sm text-base-content/70">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => respondToFriendRequest(request._id, "accepted")}
                                            className="btn btn-success btn-sm"
                                        >
                                            <IoCheckmark size={20} />
                                            <span>接受</span>
                                        </button>
                                        <button
                                            onClick={() => respondToFriendRequest(request._id, "rejected")}
                                            className="btn btn-error btn-sm"
                                        >
                                            <IoClose size={20} />
                                            <span>拒绝</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendRequests; 