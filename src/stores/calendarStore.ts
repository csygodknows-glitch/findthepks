import { create } from 'zustand';
import type { Event } from '../property';

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
  saveChanges: () => void;
  cancelChanges: () => void;
}

const today = new Date();
const initialDate = formatDateKey(today);

const useCalendarStore = create<CalendarStore>((set) => ({
  selectedDate: initialDate,
  viewMonth: today.getMonth(),
  viewYear: today.getFullYear(),
  selectionMode: 'view',
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
  saveChanges: () =>
    set((state) => ({
      savedDateStatus: state.draftDateStatus,
      selectionMode: 'view',
    })),
  cancelChanges: () =>
    set((state) => ({
      draftDateStatus: state.savedDateStatus,
      selectionMode: 'view',
    })),
}));

export default useCalendarStore;
export { formatDateKey };