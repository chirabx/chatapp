import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { preloadImage, addPreloadLink } from "../lib/preloadUtils";
import { getBackgroundById } from "../constants/backgrounds";
import toast from "react-hot-toast";

// 从localStorage加载初始值
const getStoredBackgroundId = () => {
    try {
        return localStorage.getItem("chat-background-id") || null;
    } catch {
        return null;
    }
};

const getStoredOverlayOpacity = () => {
    try {
        const stored = localStorage.getItem("chat-overlay-opacity");
        return stored ? Number(stored) : 30;
    } catch {
        return 30;
    }
};

const getStoredChatBoxOpacity = () => {
    try {
        const stored = localStorage.getItem("chat-box-opacity");
        if (stored) {
            const value = Number(stored);
            // 有效的选项：40, 55, 70, 85, 100
            // 如果是有效值，直接返回
            if ([40, 55, 70, 85, 100].includes(value)) return value;
            // 否则映射到最接近的选项
            if (value < 40) return 40;
            else if (value < 55) return 40;
            else if (value < 70) return 55;
            else if (value < 85) return 70;
            else if (value < 100) return 85;
            else return 100;
        }
        return 70;
    } catch {
        return 70;
    }
};

export const useBackgroundStore = create((set, get) => ({
    // 当前选中的背景ID（从localStorage初始化）
    currentBackgroundId: getStoredBackgroundId(),
    // 遮罩透明度（0-80）
    overlayOpacity: getStoredOverlayOpacity(),
    // 聊天框透明度（40-100，对应不透明度，值越大越不透明）
    chatBoxOpacity: getStoredChatBoxOpacity(),
    // 是否正在更新
    isUpdating: false,

    // 设置背景（同步到服务器和本地）
    setBackground: async (backgroundId) => {
        const { isUpdating } = get();
        if (isUpdating) return;

        set({ isUpdating: true });
        try {
            // 立即更新本地状态和localStorage，提升用户体验
            set({ currentBackgroundId: backgroundId });
            localStorage.setItem("chat-background-id", backgroundId || "");

            // 如果切换了背景，预加载新背景并添加 preload link
            if (backgroundId) {
                const newBackground = getBackgroundById(backgroundId);
                if (newBackground?.path) {
                    addPreloadLink(newBackground.path);
                    preloadImage(newBackground.path).catch(() => { });
                }
            }

            // 同步到服务器 - 将 null 转换为空字符串
            await axiosInstance.put("/auth/update-profile", {
                backgroundId: backgroundId || ""
            });

            // 更新 authUser
            const { authUser } = useAuthStore.getState();
            if (authUser) {
                useAuthStore.setState({
                    authUser: { ...authUser, backgroundId }
                });
            }

            toast.success("背景已更新");
        } catch (error) {
            console.error("更新背景失败:", error);
            // 失败时恢复之前的状态
            const { authUser } = useAuthStore.getState();
            const previousBackgroundId = authUser?.backgroundId || null;
            set({ currentBackgroundId: previousBackgroundId });
            localStorage.setItem("chat-background-id", previousBackgroundId || "");
            toast.error(error.response?.data?.message || "更新背景失败");
        } finally {
            set({ isUpdating: false });
        }
    },

    // 设置遮罩透明度
    setOverlayOpacity: async (opacity) => {
        const { isUpdating } = get();
        if (isUpdating) return;

        set({ isUpdating: true });
        try {
            // 立即更新本地状态和localStorage
            set({ overlayOpacity: opacity });
            localStorage.setItem("chat-overlay-opacity", opacity.toString());

            // 同步到服务器
            await axiosInstance.put("/auth/update-profile", { overlayOpacity: opacity });

            // 更新 authUser
            const { authUser } = useAuthStore.getState();
            if (authUser) {
                useAuthStore.setState({
                    authUser: { ...authUser, overlayOpacity: opacity }
                });
            }

            toast.success("遮罩透明度已更新");
        } catch (error) {
            console.error("更新遮罩透明度失败:", error);
            // 失败时恢复之前的状态
            const { authUser } = useAuthStore.getState();
            const previousOpacity = authUser?.overlayOpacity ?? 30;
            set({ overlayOpacity: previousOpacity });
            localStorage.setItem("chat-overlay-opacity", previousOpacity.toString());
            toast.error(error.response?.data?.message || "更新遮罩透明度失败");
        } finally {
            set({ isUpdating: false });
        }
    },

    // 设置聊天框透明度
    setChatBoxOpacity: async (opacity) => {
        const { isUpdating } = get();
        if (isUpdating) return;

        set({ isUpdating: true });
        try {
            // 立即更新本地状态和localStorage
            set({ chatBoxOpacity: opacity });
            localStorage.setItem("chat-box-opacity", opacity.toString());

            // 同步到服务器
            await axiosInstance.put("/auth/update-profile", { chatBoxOpacity: opacity });

            // 更新 authUser
            const { authUser } = useAuthStore.getState();
            if (authUser) {
                useAuthStore.setState({
                    authUser: { ...authUser, chatBoxOpacity: opacity }
                });
            }

            toast.success("聊天框透明度已更新");
        } catch (error) {
            console.error("更新聊天框透明度失败:", error);
            // 失败时恢复之前的状态
            const { authUser } = useAuthStore.getState();
            const previousOpacity = authUser?.chatBoxOpacity ?? 70;
            set({ chatBoxOpacity: previousOpacity });
            localStorage.setItem("chat-box-opacity", previousOpacity.toString());
            toast.error(error.response?.data?.message || "更新聊天框透明度失败");
        } finally {
            set({ isUpdating: false });
        }
    },

    // 初始化背景（从authUser加载）
    initBackground: (backgroundId, overlayOpacity, chatBoxOpacity) => {
        const backgroundIdToSet = backgroundId || null;
        const opacityToSet = overlayOpacity ?? 30;
        let chatBoxOpacityToSet = chatBoxOpacity ?? 70;
        // 确保值在有效范围内（40-100），并映射到最接近的选项
        if (chatBoxOpacityToSet < 40) chatBoxOpacityToSet = 40;
        else if (chatBoxOpacityToSet > 100) chatBoxOpacityToSet = 100;
        else if (![40, 55, 70, 85, 100].includes(chatBoxOpacityToSet)) {
            // 映射到最接近的选项
            if (chatBoxOpacityToSet < 55) chatBoxOpacityToSet = 40;
            else if (chatBoxOpacityToSet < 70) chatBoxOpacityToSet = 55;
            else if (chatBoxOpacityToSet < 85) chatBoxOpacityToSet = 70;
            else if (chatBoxOpacityToSet < 100) chatBoxOpacityToSet = 85;
            else chatBoxOpacityToSet = 100;
        }
        set({
            currentBackgroundId: backgroundIdToSet,
            overlayOpacity: opacityToSet,
            chatBoxOpacity: chatBoxOpacityToSet
        });
        localStorage.setItem("chat-background-id", backgroundIdToSet || "");
        localStorage.setItem("chat-overlay-opacity", opacityToSet.toString());
        localStorage.setItem("chat-box-opacity", chatBoxOpacityToSet.toString());

        // 智能预加载：预加载当前使用的背景图
        if (backgroundIdToSet) {
            const background = getBackgroundById(backgroundIdToSet);
            if (background?.path) {
                // 使用 link rel="preload" 预加载关键背景
                addPreloadLink(background.path);
                // 同时使用 Image 预加载
                preloadImage(background.path).catch(() => {
                    // 静默失败，不影响用户体验
                });
            }
        }
    },

    // 预加载当前背景（用于手动触发）
    preloadCurrentBackground: () => {
        const { currentBackgroundId } = get();
        if (currentBackgroundId) {
            const background = getBackgroundById(currentBackgroundId);
            if (background?.path) {
                addPreloadLink(background.path);
                preloadImage(background.path).catch(() => { });
            }
        }
    },

    // 清除背景
    clearBackground: () => {
        set({ currentBackgroundId: null });
        localStorage.removeItem("chat-background-id");
    },
}));

