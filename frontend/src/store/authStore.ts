import { create } from "zustand";

interface AuthState {
  token: string | null;
  userId: string | null;
  login: (token: string, userId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("viaher_token"),
  userId: localStorage.getItem("viaher_user_id"),
  login: (token, userId) => {
    localStorage.setItem("viaher_token", token);
    localStorage.setItem("viaher_user_id", userId);
    set({ token, userId });
  },
  logout: () => {
    localStorage.removeItem("viaher_token");
    localStorage.removeItem("viaher_user_id");
    set({ token: null, userId: null });
  },
}));
