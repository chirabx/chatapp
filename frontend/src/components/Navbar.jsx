import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { LogOut, MessageSquare, Settings, User, Bell } from "lucide-react";
import FriendRequestIcon from "./FriendRequestIcon";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const { friendRequests } = useFriendStore();

    return (
        <header
            className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
            backdrop-blur-lg bg-base-100/80"
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
                    </div>

                    <div className="flex items-center space-x-4">
                        <FriendRequestIcon />
                        <Link
                            to="/settings"
                            className="btn btn-sm gap-2 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">设置</span>
                        </Link>

                        {authUser && (
                            <>
                                <Link to="/profile" className="btn btn-sm gap-2">
                                    <User className="size-5" />
                                    <span className="hidden sm:inline">个人资料</span>
                                </Link>

                                <button
                                    onClick={logout}
                                    className="btn btn-sm btn-ghost gap-2"
                                >
                                    <LogOut className="size-5" />
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