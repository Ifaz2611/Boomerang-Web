const STYLES: Record<string, { dot: string; pill: string; label: string }> = {
  pending: { dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800 ring-amber-200", label: "In review" },
  published: { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-800 ring-emerald-200", label: "Open" },
  claimed: { dot: "bg-sky-500", pill: "bg-sky-50 text-sky-800 ring-sky-200", label: "Claimed" },
  resolved: { dot: "bg-slate-400", pill: "bg-slate-100 text-slate-600 ring-slate-200", label: "Returned" },
  rejected: { dot: "bg-rose-500", pill: "bg-rose-50 text-rose-800 ring-rose-200", label: "Rejected" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? STYLES.pending!;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${s.pill}`}
      aria-label={`Status: ${status}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}
