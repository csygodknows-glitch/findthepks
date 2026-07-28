export interface data {
  users: user[];
  events: Event[];
}

export interface user{
    name: string;
    availabilities: availability[];
}

export interface availability {
    date: Date;
    type: ['full' | 'day' | 'night'];
}

export interface Event {
  startDateTime: string;
  endDateTime: string;
  title: string;
  description: string;
  type: ['none' | 'custom' | 'full' | 'lunch'|'dinner'];
  accepted: string[];
  rejected: string[];
}