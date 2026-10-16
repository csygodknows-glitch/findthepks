import { useState } from 'react';
import useGroupStore from '../stores/groupStore';
import UserProfilePanel from './UserProfilePanel';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

export default function HeaderBar() {
  const { users, currentUserId } = useGroupStore();
  const user = users.find((u) => u.id === currentUserId) ?? null;
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-10 border-b border-slate-600/60 shadow-lg shadow-slate-950/40 backdrop-blur-md"
      style={{
        backgroundImage:
          'radial-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(180deg, rgba(51, 65, 85, 0.75) 0%, rgba(30, 41, 59, 0.75) 100%)',
        backgroundSize: '14px 14px, 100% 100%',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <span className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
          Find The PKs
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setPanelOpen((open) => !open)}
            className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-slate-700/40"
          >
            {user ? (
              <>
                <span className="hidden text-sm text-slate-200 sm:inline">{user.name}</span>
                <span
                  title={user.name}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/25 text-sm font-semibold text-cyan-100 ring-1 ring-cyan-300/50"
                >
                  {initials(user.name)}
                </span>
              </>
            ) : (
              <span className="h-10 w-10 animate-pulse rounded-full bg-slate-600" />
            )}
          </button>

          {panelOpen ? <UserProfilePanel onClose={() => setPanelOpen(false)} /> : null}
        </div>
      </div>
    </header>
  );
}
