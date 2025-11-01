import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import GroupChat from "../components/GroupChat";
import NoChatSelected from "../components/NoChatSelected";
import BotChat from "../components/BotChat";

const HomePage = () => {
    const { selectedUser } = useChatStore();
    const { selectedGroup } = useGroupStore();

    console.log("HomePage - selectedUser:", selectedUser);
    console.log("HomePage - selectedGroup:", selectedGroup);

    return (
        <div className="flex items-center justify-center pt-20 px-4 min-h-screen">
            <div className="bg-base-100/70 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)] border border-base-300/50">
                <div className="flex h-full rounded-lg overflow-hidden">
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
