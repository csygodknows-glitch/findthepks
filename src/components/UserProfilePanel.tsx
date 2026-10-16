import { useEffect, useRef } from 'react';
import useGroupStore from '../stores/groupStore';

interface UserProfilePanelProps {
  onClose: () => void;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

export default function UserProfilePanel({ onClose }: UserProfilePanelProps) {
  const { users, currentUserId, groups } = useGroupStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const user = users.find((u) => u.id === currentUserId) ?? null;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const handleClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  const memberGroups = user
    ? groups.filter((g) => g.userIds.includes(user.id))
    : [];

  return (
    <div
      ref={panelRef}
      className="absolute right-6 top-full z-20 mt-2 w-72 rounded-3xl border border-slate-600/60 bg-slate-800/95 p-5 shadow-2xl shadow-slate-950/60 backdrop-blur-md"
    >
      {user ? (
        <>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/25 text-base font-semibold text-cyan-100 ring-1 ring-cyan-300/50">
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="mb-4 rounded-2xl bg-slate-900/60 p-3 text-xs text-slate-300">
            <p className="mb-1 font-semibold uppercase tracking-wider text-slate-500">
              Groups ({memberGroups.length})
            </p>
            {memberGroups.length === 0 ? (
              <p className="text-slate-500">Not in any group yet.</p>
            ) : (
              <ul className="space-y-1">
                {memberGroups.map((g) => (
                  <li key={g.id} className="truncate">{g.name}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-600 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-rose-400 hover:text-rose-200"
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="py-4 text-center text-sm text-slate-400">
          <p className="mb-3">Not logged in.</p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}
