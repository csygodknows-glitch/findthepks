import { useEffect, useMemo } from 'react';
import CalendarGrid from './components/CalendarGrid';
import CalendarHeader from './components/CalendarHeader';
import DetailsPanel from './components/DetailsPanel';
import EventList from './components/EventList';
import type { Event } from './property';
import useCalendarStore, { createEmptyEvent, formatDateKey, type SharedEvents } from './stores/calendarStore';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface CalendarProps {
  currentUser: string;
  users: string[];
}

function Calendar({ currentUser, users }: CalendarProps) {
  const {
    selectedDate,
    viewMonth,
    viewYear,
    selectionMode,
    savedEvents,
    draftEvents,
    savedDateStatus,
    draftDateStatus,
    newEvent,
    setSelectedDate,
    setViewMonth,
    setViewYear,
    setSelectionMode,
    setSavedEvents,
    setDraftDateStatus,
    //setSavedDateStatus,
    setNewEvent,
  } = useCalendarStore();

  const days = useMemo(() => buildDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const selectedDateLabel = (() => {
    const date = new Date(selectedDate);
    return `${weekDays[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  })();

  const selectedEvents = (savedEvents as Event[]).filter((event) => event.startDateTime <= selectedDate && event.endDateTime >= selectedDate);
  const isDirty = JSON.stringify(savedDateStatus) !== JSON.stringify(draftDateStatus);

  useEffect(() => {
    //setDraftEvents(savedEvents);
    setDraftDateStatus(savedDateStatus);
    setNewEvent(createEmptyEvent(selectedDate));
  }, []);

  const onPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
  };

  const onNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
  };

  const onAddEvent = () => {
    const title = newEvent.title.trim();
    const description = newEvent.description.trim();
    const duration = newEvent.type[0] ?? 'none';

    if (!title || duration === 'none') return;

    const startDate = newEvent.startDateTime || selectedDate;
    const endDate = newEvent.endDateTime || selectedDate;
    const datesToUpdate = getDateRange(startDate, endDate);

    const buildNextEventState = (current: SharedEvents) => {
      const nextState = [...current];
      const eventToAdd: Event = {
        title,
        description,
        startDateTime: startDate,
        endDateTime: endDate,
        type: [duration] as Event['type'],
        accepted: [currentUser],
        rejected: [],
      };

      datesToUpdate.forEach(() => {
        nextState.push(eventToAdd);
      });

      return nextState;
    };

    //setDraftEvents((current) => buildNextEventState(current));
    setSavedEvents((current) => buildNextEventState(current));
    savedEvents
    setNewEvent(createEmptyEvent(selectedDate));
  };

  const updateEventResponses = (current: SharedEvents, user: string, eventToMatch: Event, response: 'accepted' | 'rejected') => {
    return current.map((entry) => {
      if (entry.title !== eventToMatch.title || entry.startDateTime !== eventToMatch.startDateTime || entry.endDateTime !== eventToMatch.endDateTime) {
        return entry;
      }

      const nextAccepted = entry.accepted.filter((person) => person !== user);
      const nextRejected = entry.rejected.filter((person) => person !== user);

      if (response === 'accepted') {
        nextAccepted.push(user);
      } else {
        nextRejected.push(user);
      }

      return {
        ...entry,
        accepted: nextAccepted,
        rejected: nextRejected,
      };
    });
  };

  const onRespondToEvent = (event: Event, response: 'accepted' | 'rejected') => {
    //setDraftEvents((current) => updateEventResponses(current, currentUser, event, response));
    setSavedEvents((current) => updateEventResponses(current, currentUser, event, response));
  };

  const selectedStatus = draftDateStatus[currentUser]?.[selectedDate] ?? null;

  const availability = useMemo(() => {
    return users.reduce<Record<string, 'full' | 'day' | 'night' | null>>((acc, user) => {
      acc[user] = draftDateStatus[user]?.[selectedDate] ?? null;
      return acc;
    }, {});
  }, [draftDateStatus, selectedDate, users]);

  const countFreeBusy = (dateKey: string) => {
    let freeCount = 0;
    let dayCount = 0;
    let nightCount = 0;

    users.forEach((user) => {
      const status = draftDateStatus[user]?.[dateKey];
      if (status === 'full') freeCount += 1;
      if (status === 'day') dayCount += 1;
      if (status === 'night') nightCount += 1;
    });

    return { freeCount, dayCount, nightCount };
  };

  const onDayClick = (day: number | null) => {
    if (day === null) return;
    const date = new Date(viewYear, viewMonth, day + 1);
    const dateKey = formatDateKey(date);

    if (selectionMode === 'full' || selectionMode === 'night' || selectionMode === 'day') {
      setDraftDateStatus((current) => {
        const currentUserStatus = current[currentUser] ?? {};
        const nextUserStatus = { ...currentUserStatus };
        const currentStatus = nextUserStatus[dateKey];

        if (currentStatus === selectionMode) {
          delete nextUserStatus[dateKey];
        } else {
          nextUserStatus[dateKey] = selectionMode;
        }

        return {
          ...current,
          [currentUser]: nextUserStatus,
        };
      });
    }

    setSelectedDate(dateKey);
  };

  return (
    <div className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-5 shadow-2xl shadow-slate-950/40">
      <div className="text-2xl font-bold p-1 mb-3">Mark Nei When Okay</div>
      <CalendarHeader
        selectionMode={selectionMode}
        onSelectionModeChange={setSelectionMode}
        selectedStatus={selectedStatus}
      />

      <div className="relative mt-8">
        <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
          <CalendarGrid
            days={days}
            viewYear={viewYear}
            viewMonth={viewMonth}
            currentUser={currentUser}
            onDayClick={onDayClick}
            onPreviousMonth={onPreviousMonth}
            onNextMonth={onNextMonth}
            countFreeBusy={countFreeBusy}
          />

          <DetailsPanel
            selectedDateLabel={selectedDateLabel}
            onAddEvent={onAddEvent}
            users={users}
            availability={availability}
          />
        </div>

        <EventList currentUser={currentUser} onRespond={onRespondToEvent} />
      </div>
    </div>
  );
}

export default Calendar;

const getMonthDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  return { totalDays, startWeekday };
};

const buildDays = (year: number, month: number) => {
  const { totalDays, startWeekday } = getMonthDays(year, month);
  const days = Array(startWeekday).fill(null).concat(
    Array.from({ length: totalDays }, (_, index) => index + 1),
  );
  return days;
};

const getDateRange = (startDate: string, endDate: string) => {
  const dates: string[] = [];
  const start = new Date(`${startDate}`);
  const end = new Date(`${endDate}`);
  const current = new Date(start);

  while (current <= end) {
    dates.push(formatDateKey(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};
