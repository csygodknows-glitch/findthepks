import {type DayStatus, type SelectionMode} from '../stores/calendarStore';

//type SelectionMode = 'view' | 'full' | 'day' | 'night';
//type DayStatus = 'full' | 'day' | 'night';

interface CalendarHeaderProps {
  selectionMode: SelectionMode;
  onSelectionModeChange: (mode: SelectionMode) => void;
  selectedStatus: DayStatus | null;
}

export default function CalendarHeader({
  selectionMode,
  onSelectionModeChange,
  selectedStatus,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {(['view', 'full', 'day', 'night'] as SelectionMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onSelectionModeChange(mode)}
            className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
              selectionMode === mode
                ? mode === 'view'
                  ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200'
                  : mode === 'full'
                  ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                  : mode === 'day'
                  ? 'border-amber-400 bg-amber-500/10 text-amber-200'
                  : 'border-violet-400 bg-violet-500/10 text-violet-200'
                : 'border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-900'
            }`}
          >
            {mode === 'view' ? 'View' : mode === 'full' ? 'Mark full' : mode === 'day' ? 'Mark day' : 'Mark night'}
          </button>
        ))}
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
        Mode: <span className="font-semibold text-slate-100">{selectionMode}</span>
        {selectedStatus ? (
          <span className="ml-3 text-slate-400">| Selected: {selectedStatus}</span>
        ) : null}
      </div>
    </div>
  );
}
