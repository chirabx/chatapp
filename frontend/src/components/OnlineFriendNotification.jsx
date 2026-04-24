import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

const OnlineFriendNotification = ({ friendName, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // 10秒后开始淡出动画
        const fadeOutTimer = setTimeout(() => {
            setIsExiting(true);
        }, 10000);

        // 淡出动画完成后关闭
        const closeTimer = setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 10500); // 10秒 + 0.5秒淡出动画

        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(closeTimer);
        };
    }, [onClose]);

    if (!isVisible) return null;

    return (
        <div
            className={`
                bg-base-100 shadow-lg rounded-lg p-4
                border border-base-300
                flex items-center gap-3
                min-w-[200px] max-w-[300px]
                transition-all duration-500 ease-in-out
                ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
            `}
        >
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-base-content truncate">
                    {friendName}
                </p>
                <p className="text-xs text-base-content/60">
                    上线了
                </p>
            </div>
            <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            </div>
        </div>
    );
};

export default OnlineFriendNotification;

