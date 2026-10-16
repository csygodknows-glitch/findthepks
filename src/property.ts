export interface data {
  users: User[];
  groups: Group[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  // many-to-many: a user can belong to many groups, a group has many users
  userIds: string[];
}

export type DayStatus = 'full' | 'day' | 'night';
export type DateStatusMap = Record<string, Record<string, DayStatus>>;

// one group shares one calendar's data
export interface GroupCalendarData {
  events: Event[];
  dateStatus: DateStatusMap;
}

export interface Event {
  startDateTime: string;
  endDateTime: string;
  title: string;
  description: string;
  type: ['none' | 'custom' | 'full' | 'lunch' | 'dinner'];
  accepted: string[];
  rejected: string[];
}