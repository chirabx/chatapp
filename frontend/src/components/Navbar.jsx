import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { LogOut, MessageSquare, Settings, User, Bell, Gamepad2, Home } from "lucide-react";
import FriendRequestIcon from "./FriendRequestIcon";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const { friendRequests } = useFriendStore();

    return (
        <header
            className="border-b border-base-300/50 fixed w-full top-0 z-40 
            backdrop-blur-md bg-base-100/60"
        >
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-lg font-bold">Chatty</h1>
                        </Link>
                        {authUser && (
                            <Link
                                to="/"
                                className="btn btn-sm btn-ghost gap-2 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                <span className="hidden sm:inline">首页</span>
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {authUser && <FriendRequestIcon />}
                        {authUser && (
                            <>
                                <Link
                                    to="/ai-games"
                                    className="btn btn-sm btn-ghost gap-2 transition-colors"
                                >
                                    <Gamepad2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">AI 趣味游戏</span>
                                </Link>

                                <Link
                                    to="/settings"
                                    className="btn btn-sm btn-ghost gap-2 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="hidden sm:inline">设置</span>
                                </Link>

                                <Link
                                    to="/profile"
                                    className="btn btn-sm btn-ghost gap-2"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline">个人资料</span>
                                </Link>

                                <button
                                    onClick={logout}
                                    className="btn btn-sm btn-ghost gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">退出</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;