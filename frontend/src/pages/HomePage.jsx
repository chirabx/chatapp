import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useBackgroundStore } from "../store/useBackgroundStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import GroupChat from "../components/GroupChat";
import NoChatSelected from "../components/NoChatSelected";
import BotChat from "../components/BotChat";

const HomePage = () => {
    const { selectedUser } = useChatStore();
    const { selectedGroup } = useGroupStore();
    const { chatBoxOpacity } = useBackgroundStore();

    console.log("HomePage - selectedUser:", selectedUser);
    console.log("HomePage - selectedGroup:", selectedGroup);

    // chatBoxOpacity: 40-100，转换为 0-1 范围用于 CSS
    const opacityValue = chatBoxOpacity / 100;

    return (
        <div className="flex items-center justify-center pt-20 px-4 min-h-screen">
            <div className="relative backdrop-blur-sm rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)] border border-base-300/50 transition-all duration-300">
                {/* 背景层 - 应用透明度 */}
                <div
                    className="absolute inset-0 bg-base-100 rounded-lg transition-opacity duration-300"
                    style={{
                        opacity: opacityValue
                    }}
                ></div>
                {/* 内容层 */}
                <div className="relative z-10 flex h-full rounded-lg overflow-hidden">
                    <Sidebar />
                    {!selectedUser && !selectedGroup ? (
                        <NoChatSelected />
                    ) : selectedGroup ? (
                        <GroupChat />
                    ) : selectedUser?._id === 'bot' ? (
                        <BotChat />
                    ) : (
                        <ChatContainer />
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
