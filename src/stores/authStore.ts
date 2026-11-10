import { create } from 'zustand';
import type { User } from '../property';
import { api } from '../api/client';

interface AuthStore {
  user: User | null;
  error: string | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  error: null,
  login: async (username, password) => {
    set({ error: null });
    try {
      const user = await api.login(username, password);
      set({ user });
      return user;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
      return null;
    }
  },
  logout: () => set({ user: null, error: null }),
}));

export default useAuthStore;
