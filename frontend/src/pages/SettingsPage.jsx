import { useMemo, useCallback, useState, useEffect } from "react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useBackgroundStore } from "../store/useBackgroundStore";
import { BACKGROUND_CATEGORIES, getAllBackgrounds, getBackgroundById } from "../constants/backgrounds";
import { Send, Image as ImageIcon, Check, Layers } from "lucide-react";
import { useProgressiveImage } from "../hooks/useProgressiveImage";
import { preloadImages } from "../lib/preloadUtils";

const PREVIEW_MESSAGES = [
    { id: 1, content: "你好，最近怎么样？", isSent: false },
    { id: 2, content: "我很好！我正在做一些新功能。", isSent: true },
];

// 遮罩透明度选项
const OVERLAY_OPACITY_OPTIONS = [
    { value: 0, label: "0%" },
    { value: 20, label: "20%" },
    { value: 40, label: "40%" },
    { value: 60, label: "60%" },
    { value: 80, label: "80%" },
];

// 优化主题按钮组件
const ThemeButton = ({ theme, currentTheme, onClick }) => {
    return (
        <button
            key={theme}
            className={`
                group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                ${currentTheme === theme ? "bg-base-200" : "hover:bg-base-200/50"}
            `}
            onClick={onClick}
        >
            <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={theme}>
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                </div>
            </div>
            <span className="text-[11px] font-medium truncate w-full text-center">
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </span>
        </button>
    );
};

// 优化背景图片按钮组件 - 使用渐进式加载
const BackgroundImageButton = ({ image, categoryName, isSelected, isUpdating, onSelect }) => {
    const { src, placeholder, loaded } = useProgressiveImage(image.path, 80, 60);

    return (
        <button
            className={`
                relative group aspect-video rounded-lg overflow-hidden
                border-2 transition-all bg-base-200
                ${isSelected
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-base-300 hover:border-base-content/30"
                }
                ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
            onClick={onSelect}
            disabled={isUpdating}
            title={categoryName}
        >
            {/* 占位图 - 模糊效果 */}
            {placeholder && !loaded && (
                <img
                    src={placeholder}
                    alt={categoryName}
                    className="w-full h-full object-cover blur-sm scale-110"
                    aria-hidden="true"
                />
            )}
            {/* 高清图片 - 加载完成后淡入 */}
            {src && (
                <img
                    src={src}
                    alt={categoryName}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    loading="lazy"
                />
            )}
            {/* 加载指示器 */}
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="loading loading-spinner loading-xs text-base-content/40"></div>
                </div>
            )}
            {/* 选中标记 */}
            {isSelected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-content rounded-full p-1.5">
                        <Check className="w-4 h-4" />
                    </div>
                </div>
            )}
        </button>
    );
};

const SettingsPage = () => {
    const { theme, setTheme } = useThemeStore();
    const {
        currentBackgroundId,
        setBackground,
        isUpdating,
        overlayOpacity,
        setOverlayOpacity
    } = useBackgroundStore();

    // 获取预览背景
    const previewBackground = useMemo(() =>
        currentBackgroundId ? getBackgroundById(currentBackgroundId) : null,
        [currentBackgroundId]
    );

    // 设置页预加载：进入设置页时预加载所有背景缩略图
    useEffect(() => {
        // 获取所有背景图片路径
        const allBackgrounds = getAllBackgrounds();
        let backgroundPaths = allBackgrounds.map(bg => bg.path);

        // 优先加载当前选中的背景（如果存在）
        if (currentBackgroundId) {
            const currentBg = getBackgroundById(currentBackgroundId);
            if (currentBg?.path) {
                // 将当前背景移到数组最前面，优先加载
                backgroundPaths = backgroundPaths.filter(path => path !== currentBg.path);
                backgroundPaths.unshift(currentBg.path);
            }
        }

        // 批量预加载所有背景图（并发数设为3，避免阻塞）
        // 第一个（当前背景）会立即开始加载，其他的分批加载
        preloadImages(backgroundPaths, 3).catch(() => {
            // 静默失败，不影响用户体验
        });
    }, [currentBackgroundId]); // 当当前背景变化时也更新预加载

    // 渐进式加载预览背景
    const { src: previewSrc, placeholder: previewPlaceholder, loaded: previewLoaded } =
        useProgressiveImage(previewBackground?.path || null, 20, 15);

    // 构建预览背景样式 - 渐进式加载
    const previewBackgroundStyle = previewBackground && (previewPlaceholder || previewSrc)
        ? {
            backgroundImage: previewSrc
                ? `url(${previewSrc})`
                : previewPlaceholder
                    ? `url(${previewPlaceholder})`
                    : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: previewSrc ? 'none' : 'blur(20px)',
            transition: 'filter 0.3s ease-out',
        }
        : {};

    // 优化主题切换 - 使用防抖
    const handleThemeChange = useCallback((newTheme) => {
        setTheme(newTheme);
    }, [setTheme]);

    // 优化背景切换
    const handleBackgroundChange = useCallback((backgroundId) => {
        if (!isUpdating) {
            setBackground(backgroundId);
        }
    }, [setBackground, isUpdating]);

    // 遮罩透明度切换
    const handleOverlayOpacityChange = useCallback((opacity) => {
        if (!isUpdating) {
            setOverlayOpacity(opacity);
        }
    }, [setOverlayOpacity, isUpdating]);

    return (
        <div className="min-h-screen container mx-auto px-4 pt-20 pb-8 max-w-5xl">
            <div className="space-y-6">
                {/* 主题设置 - 半透明背景卡片 */}
                <div className="bg-base-100/50 backdrop-blur-md rounded-xl p-6 border border-base-300/50 shadow-lg">
                    <div className="flex flex-col gap-1 mb-4">
                        <h2 className="text-lg font-semibold">主题</h2>
                        <p className="text-sm text-base-content/70">选择一个你喜欢的主题</p>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {THEMES.map((t) => (
                            <ThemeButton
                                key={t}
                                theme={t}
                                currentTheme={theme}
                                onClick={() => handleThemeChange(t)}
                            />
                        ))}
                    </div>
                </div>

                {/* 背景图片设置 - 半透明背景卡片 */}
                <div className="bg-base-100/50 backdrop-blur-md rounded-xl p-6 border border-base-300/50 shadow-lg">
                    <div className="flex flex-col gap-1 mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            背景图片
                        </h2>
                        <p className="text-sm text-base-content/70">选择一个你喜欢的背景图片</p>
                    </div>

                    {/* 无背景选项 */}
                    <div className="flex gap-2 mb-4">
                        <button
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
                                ${!currentBackgroundId
                                    ? "bg-primary text-primary-content border-primary"
                                    : "bg-base-200 hover:bg-base-300 border-base-300"
                                }
                                ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                            onClick={() => handleBackgroundChange(null)}
                            disabled={isUpdating}
                        >
                            {!currentBackgroundId && <Check className="w-4 h-4" />}
                            <span>无背景</span>
                        </button>
                    </div>

                    {/* 按分类显示背景图片 */}
                    <div className="space-y-6">
                        {BACKGROUND_CATEGORIES.map((category) => (
                            <div key={category.id}>
                                <h3 className="text-sm font-medium mb-3 text-base-content/70">
                                    {category.name}
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {category.images.map((image) => (
                                        <BackgroundImageButton
                                            key={image.id}
                                            image={image}
                                            categoryName={category.name}
                                            isSelected={currentBackgroundId === image.id}
                                            isUpdating={isUpdating}
                                            onSelect={() => handleBackgroundChange(image.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 遮罩透明度设置 - 半透明背景卡片 */}
                <div className="bg-base-100/50 backdrop-blur-md rounded-xl p-6 border border-base-300/50 shadow-lg">
                    <div className="flex flex-col gap-1 mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Layers className="w-5 h-5" />
                            遮罩透明度
                        </h2>
                        <p className="text-sm text-base-content/70">调整背景遮罩的透明度（0%为完全透明，80%为最不透明）</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {OVERLAY_OPACITY_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
                                    ${overlayOpacity === option.value
                                        ? "bg-primary text-primary-content border-primary"
                                        : "bg-base-200 hover:bg-base-300 border-base-300"
                                    }
                                    ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                                onClick={() => handleOverlayOpacityChange(option.value)}
                                disabled={isUpdating}
                            >
                                {overlayOpacity === option.value && <Check className="w-4 h-4" />}
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview Section - 半透明背景卡片 */}
                <div className="bg-base-100/50 backdrop-blur-md rounded-xl p-6 border border-base-300/50 shadow-lg">
                    <h3 className="text-lg font-semibold mb-3">预览</h3>
                    <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
                        <div
                            className="p-4 relative min-h-[400px]"
                            style={previewBackgroundStyle}
                        >
                            {/* 预览背景磨砂遮罩层 - 使用用户选择的透明度 */}
                            <div
                                className="absolute inset-0 bg-base-200 backdrop-blur-xl transition-opacity duration-300"
                                style={{
                                    opacity: overlayOpacity / 100
                                }}
                            ></div>
                            <div className="max-w-lg mx-auto relative z-10">
                                {/* Mock Chat UI */}
                                <div className="bg-base-100/50 backdrop-blur-md rounded-xl shadow-sm overflow-hidden border border-base-300/50">
                                    {/* Chat Header */}
                                    <div className="px-4 py-3 border-b border-base-300/50 bg-base-100/50 backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                                                J
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-sm">张三</h3>
                                                <p className="text-xs text-base-content/70">在线</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100/50 backdrop-blur-sm">
                                        {PREVIEW_MESSAGES.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`
                                                    max-w-[80%] rounded-xl p-3 shadow-sm backdrop-blur-sm
                                                    ${message.isSent
                                                            ? "bg-primary/80 text-primary-content"
                                                            : "bg-base-200/70"}
                                                `}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <p
                                                        className={`
                                                        text-[10px] mt-1.5
                                                        ${message.isSent ? "text-primary-content/70" : "text-base-content/70"}
                                                    `}
                                                    >
                                                        12:00 PM
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-4 border-t border-base-300/50 bg-base-100/50 backdrop-blur-sm">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="input input-bordered flex-1 text-sm h-10 bg-base-100/70 backdrop-blur-sm"
                                                placeholder="输入一条消息..."
                                                value="这只是一个预览"
                                                readOnly
                                            />
                                            <button className="btn btn-primary h-10 min-h-0">
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
