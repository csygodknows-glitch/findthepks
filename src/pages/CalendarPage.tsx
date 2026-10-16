import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Calendar from '../Calendar';
import useGroupStore from '../stores/groupStore';
import useCalendarStore from '../stores/calendarStore';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { groups, users, currentGroupId, currentUserId } = useGroupStore();
  const { loading, error, switchGroup } = useCalendarStore();

  const group = groups.find((g) => g.id === currentGroupId) ?? null;

  useEffect(() => {
    if (group && !useCalendarStore.getState().groupData[group.id]) {
      void switchGroup(group.id);
    }
  }, [group, switchGroup]);

  if (!group) return <Navigate to="/" replace />;

  const groupUsers = group.userIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  const userNames = groupUsers.map((u) => u.name);
  const currentUser = users.find((u) => u.id === currentUserId);
  const selectedUser = userNames.includes(currentUser?.name ?? '') ? currentUser!.name : userNames[0] ?? 'Guest';

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/50">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200"
          >
            ← Back to Groups
          </button>
          <h1 className="text-lg font-semibold text-slate-100">{group.name}</h1>
        </div>

        {error ? (
          <div className="mb-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-10 text-center text-slate-500">
            Loading calendar…
          </div>
        ) : (
          <div className="mt-10">
            <Calendar currentUser={selectedUser} users={userNames} />
          </div>
        )}
      </div>
    </main>
  );
}
