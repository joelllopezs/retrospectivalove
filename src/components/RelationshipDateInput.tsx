"use client";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function RelationshipDateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <label htmlFor="relationship-start" className="font-body text-xs text-muted">
        Quando começou a história de vocês? (opcional)
      </label>
      <input
        id="relationship-start"
        type="date"
        value={value}
        max={todayISO()}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-full border border-paper/20 bg-ink/40 px-4 py-2 font-body text-sm text-paper [color-scheme:dark]"
      />
    </div>
  );
}
