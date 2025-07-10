import { create } from 'zustand';

interface UserState {
    email: string | null;
    name: string | null;
    token: string | null;
    setUser: (email: string, name: string, token: string) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    email: null,
    name: null,
    token: null,
    setUser: (email, name, token) => set({ email, name, token }),
    logout: () => {
        localStorage.removeItem('accessToken');
        set({ email: null, name: null, token: null });
    },
}));
