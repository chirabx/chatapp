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

export const useBackgroundStore = create((set, get) => ({
    // 当前选中的背景ID（从localStorage初始化）
    currentBackgroundId: getStoredBackgroundId(),
    // 遮罩透明度（0-80）
    overlayOpacity: getStoredOverlayOpacity(),
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

    // 初始化背景（从authUser加载）
    initBackground: (backgroundId, overlayOpacity) => {
        const backgroundIdToSet = backgroundId || null;
        const opacityToSet = overlayOpacity ?? 30;
        set({
            currentBackgroundId: backgroundIdToSet,
            overlayOpacity: opacityToSet
        });
        localStorage.setItem("chat-background-id", backgroundIdToSet || "");
        localStorage.setItem("chat-overlay-opacity", opacityToSet.toString());

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

