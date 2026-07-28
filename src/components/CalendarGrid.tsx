import useCalendarStore from '../stores/calendarStore';

//type DayStatus = 'full' | 'day' | 'night';

interface CalendarGridProps {
  days: Array<number | null>;
  viewYear: number;
  viewMonth: number;
  currentUser: string;
  onDayClick: (day: number | null) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  countFreeBusy: (dateKey: string) => { freeCount: number; dayCount: number; nightCount: number };
}

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

const formatDateKey = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

export default function CalendarGrid({
  days,
  viewYear,
  viewMonth,
  currentUser,
  onDayClick,
  onPreviousMonth,
  onNextMonth,
  countFreeBusy,
}: CalendarGridProps) {
  const selectedDate = useCalendarStore((state) => state.selectedDate);
  const draftDateStatus = useCalendarStore((state) => state.draftDateStatus);
  const isDirty = useCalendarStore((state) => JSON.stringify(state.savedDateStatus) !== JSON.stringify(state.draftDateStatus));
  const cancelChanges = useCalendarStore((state) => state.cancelChanges);
  const saveChanges = useCalendarStore((state) => state.saveChanges);
  const monthLabel = `${monthNames[viewMonth]} ${viewYear}`;

  return (
    <section className="rounded-2xl h-min border border-slate-800 bg-slate-900/80 p-5">
      <div className="flex items-center justify-between gap-5">
        <button
          type="button"
          onClick={onPreviousMonth}
          className="rounded-2xl border border-slate-700 bg-slate-950 px-6 py-2 text-slate-200 transition hover:bg-slate-900"
        >
          Prev
        </button>
        <div className="text-lg font-semibold text-white">{monthLabel}</div>
        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-2xl border border-slate-700 bg-slate-950 px-6 py-2 text-slate-200 transition hover:bg-slate-900"
        >
          Next
        </button>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-3 text-center text-sm uppercase tracking-[0.3em] text-slate-500">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-3 text-xs">
        {days.map((day, index) => {
          const dayKey = day !== null ? formatDateKey(new Date(viewYear, viewMonth, day + 1 )) : null;
          const isActive = dayKey === selectedDate;
          const dayStatus = dayKey ? draftDateStatus[currentUser]?.[dayKey] : null;
          const statusClasses = 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/90';

          const { freeCount, dayCount, nightCount } = dayKey ? countFreeBusy(dayKey) : { freeCount: 0, dayCount: 0, nightCount: 0 };

          return (
            <button
              key={`${viewMonth}-${viewYear}-${index}`}
              type="button"
              onClick={() => onDayClick(day)}
              className={`min-h-[4.5rem] min-w-[5.5rem] rounded-2xl border p-1.5 transition focus:outline-none ${
                day === null
                  ? 'cursor-default border-transparent bg-slate-950'
                  : isActive
                  ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-inner shadow-cyan-500/10'
                  : statusClasses
              }`}
              disabled={day === null}
            >
              <div className="flex h-full flex-col justify-between text-left">
                <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{day ?? ''}</span>

                    {dayStatus === 'full' ? (
                        <span className="text-xs text-emerald-200">✓</span>
                    ) :dayStatus === 'day' ? (
                      <span className="text-xs text-amber-200">☀</span>
                    ) : dayStatus === 'night' ? (
                      <span className="text-xs text-violet-200">🌙</span>
                    ) : null}
         
                </div>
                <div className="mt-2 flex flex-wrap justify-start gap-0.5 text-sm font-semibold">
                  {freeCount > 0 ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-emerald-200">
                      <span className="text-xs">✓</span>
                      <span className="text-xs">{freeCount}</span>
                    </span>
                  ) : null}
                  {dayCount > 0 ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-amber-200">
                      <span className="text-xs">☀</span>
                      <span className="text-xs">{dayCount}</span>
                    </span>
                  ) : null}
                  {nightCount > 0 ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-violet-200">
                      <span className="text-xs">🌙</span>
                      <span className="text-xs">{nightCount}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={cancelChanges}
          disabled={!isDirty}
          className="rounded-3xl border border-slate-700 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500 disabled:bg-slate-950"
        >
          Cancel changes
        </button>
        <button
          type="button"
          onClick={saveChanges}
          disabled={!isDirty}
          className="rounded-3xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          Save changes
        </button>
      </div>
    </section>
  );
}
