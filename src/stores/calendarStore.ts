import { create } from 'zustand';
import type { Event, GroupCalendarData } from '../property';
import { api } from '../api/client';
import useGroupStore from './groupStore';

export type DayStatus = 'full' | 'day' | 'night';
export type SharedEvents = Event[];
export type DateStatusMap = Record<string, Record<string, DayStatus>>;
export type SelectionMode = 'view' | 'full' | 'day' | 'night';

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const createEmptyEvent = (date: string): Event => ({
  title: '',
  description: '',
  startDateTime: `${date}T09:00`,
  endDateTime: `${date}T10:00`,
  type: ['none'],
  accepted: [],
  rejected: [],
});

interface CalendarStore {
  selectedDate: string;
  viewMonth: number;
  viewYear: number;
  selectionMode: SelectionMode;
  loading: boolean;
  error: string | null;
  // per-group shared calendar data; the active group's data is mirrored into
  // savedEvents/savedDateStatus so existing components keep working
  groupData: Record<string, GroupCalendarData>;
  savedEvents: SharedEvents;
  draftEvents: SharedEvents;
  savedDateStatus: DateStatusMap;
  draftDateStatus: DateStatusMap;
  newEvent: Event;
  setSelectedDate: (date: string) => void;
  setViewMonth: (value: number | ((current: number) => number)) => void;
  setViewYear: (value: number | ((current: number) => number)) => void;
  setSelectionMode: (mode: SelectionMode) => void;
  setSavedEvents: (value: SharedEvents | ((current: SharedEvents) => SharedEvents)) => void;
  //setDraftEvents: (value: SharedEvents | ((current: SharedEvents) => SharedEvents)) => void;
  setSavedDateStatus: (value: DateStatusMap | ((current: DateStatusMap) => DateStatusMap)) => void;
  setDraftDateStatus: (value: DateStatusMap | ((current: DateStatusMap) => DateStatusMap)) => void;
  setNewEvent: (value: Event | ((current: Event) => Event)) => void;
  switchGroup: (groupId: string) => Promise<void>;
  saveChanges: () => Promise<void>;
  cancelChanges: () => void;
}

const today = new Date();
const initialDate = formatDateKey(today);

const useCalendarStore = create<CalendarStore>((set) => ({
  selectedDate: initialDate,
  viewMonth: today.getMonth(),
  viewYear: today.getFullYear(),
  selectionMode: 'view',
  loading: false,
  error: null,
  groupData: {},
  savedEvents: [],
  draftEvents: [],
  savedDateStatus: {},
  draftDateStatus: {},
  newEvent: createEmptyEvent(initialDate),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setViewMonth: (value) =>
    set((state) => ({
      viewMonth: typeof value === 'function' ? value(state.viewMonth) : value,
    })),
  setViewYear: (value) =>
    set((state) => ({
      viewYear: typeof value === 'function' ? value(state.viewYear) : value,
    })),
  setSelectionMode: (selectionMode) => set({ selectionMode }),
  setSavedEvents: (value) =>
    set((state) => ({
      savedEvents: typeof value === 'function' ? value(state.savedEvents) : value,
    })),
  /*setDraftEvents: (value) =>
    set((state) => ({
      draftEvents: typeof value === 'function' ? value(state.draftEvents) : value,
    })),*/
  setSavedDateStatus: (value) =>
    set((state) => ({
      savedDateStatus: typeof value === 'function' ? value(state.savedDateStatus) : value,
    })),
  setDraftDateStatus: (value) =>
    set((state) => ({
      draftDateStatus: typeof value === 'function' ? value(state.draftDateStatus) : value,
    })),
  setNewEvent: (value) =>
    set((state) => ({
      newEvent: typeof value === 'function' ? value(state.newEvent) : value,
    })),
  switchGroup: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const data = await api.fetchGroupCalendar(groupId);
      set((state) => ({
        groupData: { ...state.groupData, [groupId]: data },
        savedEvents: data.events,
        draftEvents: data.events,
        savedDateStatus: data.dateStatus,
        draftDateStatus: data.dateStatus,
        selectionMode: 'view',
        loading: false,
      }));
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
  saveChanges: async () => {
    const groupId = useGroupStore.getState().currentGroupId;
    if (!groupId) return;
    const { savedEvents, draftDateStatus } = useCalendarStore.getState();
    const data: GroupCalendarData = { events: savedEvents, dateStatus: draftDateStatus };
    try {
      await api.saveGroupCalendar(groupId, data);
      set((state) => ({
        groupData: { ...state.groupData, [groupId]: data },
        savedDateStatus: draftDateStatus,
        selectionMode: 'view',
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
    }
  },
  cancelChanges: () =>
    set((state) => ({
      draftDateStatus: state.savedDateStatus,
      selectionMode: 'view',
    })),
}));

export default useCalendarStore;
export { formatDateKey };