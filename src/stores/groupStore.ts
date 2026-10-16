import { create } from 'zustand';
import type { Group, User } from '../property';
import { api } from '../api/client';

interface GroupStore {
  users: User[];
  groups: Group[];
  currentUserId: string | null;
  currentGroupId: string | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  selectGroup: (id: string) => void;
  createGroup: (name: string) => Promise<Group | null>;
}

const useGroupStore = create<GroupStore>((set, get) => ({
  users: [],
  groups: [],
  currentUserId: null,
  currentGroupId: null,
  loading: false,
  error: null,
  load: async () => {
    set({ loading: true, error: null });
    try {
      const [users, groups] = await Promise.all([api.fetchUsers(), api.fetchGroups()]);
      set({
        users,
        groups,
        currentUserId: get().currentUserId ?? users[0]?.id ?? null,
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
  selectGroup: (currentGroupId) => set({ currentGroupId }),
  createGroup: async (name) => {
    const trimmed = name.trim();
    const currentUserId = get().currentUserId;
    if (!trimmed || !currentUserId) return null;
    try {
      const group = await api.createGroup(trimmed);
      const updated = await api.addGroupMember(group.id, currentUserId);
      set((state) => ({
        groups: [...state.groups, updated],
        currentGroupId: updated.id,
      }));
      return updated;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
      return null;
    }
  },
}));

export default useGroupStore;
