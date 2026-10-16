import type { Group, GroupCalendarData, User } from '../property';

// In-memory mock backend. Data resets on page reload.
const users: User[] = [
  { id: 'u1', name: 'Alice', email: 'alice@example.com' },
  { id: 'u2', name: 'Bob', email: 'bob@example.com' },
];

const groups: Group[] = [
  { id: 'g1', name: 'Weekend Hikers', userIds: ['u1', 'u2'] },
  { id: 'g2', name: 'Board Game Night', userIds: ['u1', 'u2'] },
];

const calendars: Record<string, GroupCalendarData> = {
  g1: {
    events: [
      {
        startDateTime: new Date().toISOString().slice(0, 10) + 'T10:00:00',
        endDateTime: new Date().toISOString().slice(0, 10) + 'T14:00:00',
        title: 'Trail hike',
        description: 'Meet at the trailhead, bring water.',
        type: ['custom'],
        accepted: ['Alice'],
        rejected: [],
      },
    ],
    dateStatus: {
      Alice: {},
      Bob: {},
    },
  },
  g2: {
    events: [],
    dateStatus: {
      Alice: {},
      Bob: {},
    },
  },
};

let nextId = 3;
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async fetchUsers(): Promise<User[]> {
    await delay();
    return [...users];
  },

  async fetchGroups(): Promise<Group[]> {
    await delay();
    return groups.map((g) => ({ ...g, userIds: [...g.userIds] }));
  },

  async createGroup(name: string): Promise<Group> {
    await delay();
    const group: Group = { id: `g${nextId++}`, name, userIds: [] };
    groups.push(group);
    calendars[group.id] = { events: [], dateStatus: {} };
    return { ...group };
  },

  async addGroupMember(groupId: string, userId: string): Promise<Group> {
    await delay();
    const group = groups.find((g) => g.id === groupId);
    if (!group) throw new Error(`Group ${groupId} not found`);
    if (!group.userIds.includes(userId)) group.userIds.push(userId);
    return { ...group, userIds: [...group.userIds] };
  },

  async fetchGroupCalendar(groupId: string): Promise<GroupCalendarData> {
    await delay();
    const data = calendars[groupId];
    if (!data) throw new Error(`Calendar for group ${groupId} not found`);
    return JSON.parse(JSON.stringify(data)) as GroupCalendarData;
  },

  async saveGroupCalendar(groupId: string, data: GroupCalendarData): Promise<GroupCalendarData> {
    await delay();
    calendars[groupId] = JSON.parse(JSON.stringify(data)) as GroupCalendarData;
    return calendars[groupId];
  },
};
