import { useBackgroundStore } from "../store/useBackgroundStore";
import { getBackgroundById } from "../constants/backgrounds";
import { useProgressiveImage } from "../hooks/useProgressiveImage";

const BackgroundLayout = ({ children }) => {
    const { currentBackgroundId, overlayOpacity } = useBackgroundStore();

    // 获取背景图片路径
    const background = currentBackgroundId ? getBackgroundById(currentBackgroundId) : null;

    // 渐进式加载背景图片
    const { src, placeholder, loaded } = useProgressiveImage(background?.path || null, 20, 15);

    // 构建背景样式 - 先显示占位图，加载完成后显示高清图
    const backgroundStyle = background && (placeholder || src)
        ? {
            backgroundImage: src
                ? `url(${src})`
                : placeholder
                    ? `url(${placeholder})`
                    : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'scroll',
            filter: src ? 'none' : 'blur(20px)',
            transition: 'filter 0.3s ease-out',
        }
        : {};

    return (
        <div
            className="min-h-screen bg-base-200 transition-all duration-500 relative"
            style={backgroundStyle}
        >
            {/* 动态遮罩层 - 使用用户选择的透明度 */}
            <div
                className="absolute inset-0 bg-base-200 transition-opacity duration-300"
                style={{
                    opacity: overlayOpacity / 100
                }}
            ></div>
            {/* 加载指示器 - 仅在加载中显示 */}
            {background && !loaded && (
                <div className="absolute inset-0 flex items-center justify-center z-0">
                    <div className="loading loading-spinner loading-lg text-base-content/30"></div>
                </div>
            )}

            {/* 内容区域 */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default BackgroundLayout;

