import type { Group, GroupCalendarData, User } from '../property';
import { mockApi } from './mock';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';
// Mock mode is on by default; set VITE_USE_MOCK_API=false to hit the real API.
const USE_MOCK = (import.meta.env.VITE_USE_MOCK_API ?? 'true') !== 'false';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}${body ? `: ${body}` : ''}`);
  }
  return res.json() as Promise<T>;
}

const realApi = {
  // users
  fetchUsers: () => request<User[]>('/users'),

  // groups (many-to-many with users via Group.userIds)
  fetchGroups: () => request<Group[]>('/groups'),
  createGroup: (name: string) =>
    request<Group>('/groups', { method: 'POST', body: JSON.stringify({ name }) }),
  addGroupMember: (groupId: string, userId: string) =>
    request<Group>(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // one group shares one calendar's data (events + availability)
  fetchGroupCalendar: (groupId: string) =>
    request<GroupCalendarData>(`/groups/${groupId}/calendar`),
  saveGroupCalendar: (groupId: string, data: GroupCalendarData) =>
    request<GroupCalendarData>(`/groups/${groupId}/calendar`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const api = USE_MOCK ? mockApi : realApi;
