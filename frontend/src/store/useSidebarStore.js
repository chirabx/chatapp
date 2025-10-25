import { create } from 'zustand';

export const useSidebarStore = create((set, get) => ({
    activeTab: 'friends', // 'friends' or 'groups'

    setActiveTab: (tab) => {
        set({ activeTab: tab });
    },

    switchToGroups: () => {
        set({ activeTab: 'groups' });
    },

    switchToFriends: () => {
        set({ activeTab: 'friends' });
    },
}));
