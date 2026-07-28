interface UserSelectorProps {
  users: string[];
  selectedUser: string;
  newUserName: string;
  onSelectUser: (user: string) => void;
  onNewUserNameChange: (value: string) => void;
  onAddUser: () => void;
}

export default function UserSelector({
  users,
  selectedUser,
  newUserName,
  onSelectUser,
  onNewUserNameChange,
  onAddUser,
}: UserSelectorProps) {
  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-inner shadow-slate-950/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/90">Choose PK:</p>
        </div>

        <div className="flex min-w-[18rem] flex-1 items-center gap-3">
          <label className="sr-only" htmlFor="user-select">
            Current user
          </label>
          <select
            id="user-select"
            value={selectedUser}
            onChange={(event) => onSelectUser(event.target.value)}
            className="w-full rounded-3xl border border-cyan-400/30 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
          >
            {users.map((user) => (
              <option key={user} value={user} className="bg-slate-950 text-slate-100">
                {user}
              </option>
            ))}
          </select>

          <div className="flex flex-1 gap-3">
            <input
              value={newUserName}
              onChange={(event) => onNewUserNameChange(event.target.value)}
              placeholder="Add Unknown PK"
              className="flex-1 rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
              type="button"
              onClick={onAddUser}
              className="rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
