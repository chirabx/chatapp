import { create } from "zustand";

export const useLoadingStore = create((set, get) => ({
    // 全局加载状态
    isLoading: false,
    loadingMessage: "",

    // 页面级别的加载状态
    pageLoading: {
        friends: false,
        groups: false,
        friendRequests: false,
        groupSettings: false,
        messages: false,
        profile: false
    },

    // 设置全局加载状态
    setLoading: (isLoading, message = "") => {
        set({ isLoading, loadingMessage: message });
    },

    // 设置页面加载状态
    setPageLoading: (page, isLoading) => {
        set((state) => ({
            pageLoading: {
                ...state.pageLoading,
                [page]: isLoading
            }
        }));
    },

    // 批量设置页面加载状态
    setMultiplePageLoading: (pages) => {
        set((state) => ({
            pageLoading: {
                ...state.pageLoading,
                ...pages
            }
        }));
    },

    // 清除所有加载状态
    clearAllLoading: () => {
        set({
            isLoading: false,
            loadingMessage: "",
            pageLoading: {
                friends: false,
                groups: false,
                friendRequests: false,
                groupSettings: false,
                messages: false,
                profile: false
            }
        });
    }
}));
