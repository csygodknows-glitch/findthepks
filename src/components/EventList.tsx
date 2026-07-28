import type { Event } from '../property';
import useCalendarStore from '../stores/calendarStore';

interface EventListProps {
  currentUser: string;
  onRespond: (event: Event, response: 'accepted' | 'rejected') => void;
}

function formatEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function EventList({ currentUser, onRespond }: EventListProps) {
  const events = useCalendarStore((state) => state.savedEvents);

  const hasResponded = (event: Event, response: 'accepted' | 'rejected') => {
    return response === 'accepted' ? event.accepted.includes(currentUser) : event.rejected.includes(currentUser);
  };

  return (
    <section className="mt-6 rounded-[2rem] border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/30">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/90">Events</p>
          <p className="mt-2 text-sm text-slate-400">All created events and your response</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center text-slate-500">
          No events yet.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => {
            const acceptedLabel = event.accepted.length > 0 ? `${event.accepted.length} accepted` : 'No accepts yet';
            const rejectedLabel = event.rejected.length > 0 ? `${event.rejected.length} rejected` : 'No rejections yet';

            return (
              <article key={`${event.title}-${event.startDateTime}-${index}`} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-slate-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{event.title || event.description || 'Untitled event'}</div>
                    <div className="mt-2 text-sm text-slate-400">
                      {event.type[0]} • {formatEventDate(event.startDateTime)} to {formatEventDate(event.endDateTime)}
                    </div>
                    {event.description ? <div className="mt-2 text-sm text-slate-400">{event.description}</div> : null}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onRespond(event, 'accepted')}
                      disabled={hasResponded(event, 'accepted')}
                      className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => onRespond(event, 'rejected')}
                      disabled={hasResponded(event, 'rejected')}
                      className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1">{acceptedLabel}</span>
                  <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1">{rejectedLabel}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
