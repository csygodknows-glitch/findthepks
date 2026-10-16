import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGroupStore from '../stores/groupStore';
import useCalendarStore from '../stores/calendarStore';

export default function GroupSelectPage() {
  const navigate = useNavigate();
  const { groups, currentGroupId, loading, error, load, createGroup, selectGroup } = useGroupStore();
  const switchGroup = useCalendarStore((state) => state.switchGroup);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || creating) return;
    setCreating(true);
    const group = await createGroup(newGroupName);
    setCreating(false);
    if (group) {
      setNewGroupName('');
      //navigate('/calendar');
    }
  };

  const handleSelectGroup = (id: string) => {
    selectGroup(id);
    switchGroup(id);
    navigate('/calendar');
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/50">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/90">Select Group</p>
          <p className="mt-2 text-slate-400">
            Each group shares one calendar. Pick a group or create a new one.
          </p>
        </div>

        <div className="mb-6 flex gap-3">
          <input
            value={newGroupName}
            onChange={(event) => setNewGroupName(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && void handleCreateGroup()}
            placeholder="New group name"
            className="flex-1 rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          />
          <button
            type="button"
            onClick={() => void handleCreateGroup()}
            disabled={!newGroupName.trim() || creating}
            className="rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {creating ? 'Creating…' : '+ Create Group'}
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center text-slate-500">
            Loading…
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center text-slate-500">
            No groups yet.
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => handleSelectGroup(group.id)}
                className={`w-full rounded-3xl border px-6 py-4 text-left text-sm font-semibold transition ${
                  group.id === currentGroupId
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200'
                    : 'border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900'
                }`}
              >
                {group.name}
                <span className="ml-3 text-xs font-normal text-slate-400">
                  {group.userIds.length} member{group.userIds.length === 1 ? '' : 's'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
