import { create } from 'zustand';

interface UserState {
    username: string;
    accessToken: string;
    setUser: (username: string, accessToken: string) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    username: '',
    accessToken: '',
    setUser: (username, accessToken) => set({ username, accessToken }),
    logout: () => set({ username: '', accessToken: '' }),
}));
