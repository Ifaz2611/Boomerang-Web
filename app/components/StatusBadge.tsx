const STYLES: Record<string, { dot: string; pill: string; label: string }> = {
  pending: { dot: "bg-gold-500", pill: "bg-[#faf3df] text-gold-600 ring-[#e3d194]", label: "In review" },
  published: { dot: "bg-[#1f5c3d]", pill: "bg-[#e6f0e8] text-[#1f5c3d] ring-[#bcd8c2]", label: "Open" },
  claimed: { dot: "bg-navy-700", pill: "bg-[#e4ebf5] text-navy-800 ring-[#b9c8e0]", label: "Claimed" },
  resolved: { dot: "bg-slate-400", pill: "bg-slate-100 text-slate-600 ring-slate-200", label: "Returned" },
  rejected: { dot: "bg-[#7a1f1f]", pill: "bg-[#f7e8e8] text-[#7a1f1f] ring-[#e3c2c2]", label: "Rejected" },
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
