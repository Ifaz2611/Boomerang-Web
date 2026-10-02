const STYLES: Record<string, { dot: string; pill: string; label: string }> = {
  pending: { dot: "bg-primary", pill: "bg-[rgba(124,59,237,0.15)] text-primary", label: "In review" },
  published: { dot: "bg-teal-accent", pill: "bg-[rgba(24,191,141,0.15)] text-[#0e7a5b]", label: "Open" },
  claimed: { dot: "bg-cyan-accent", pill: "bg-[rgba(0,193,214,0.2)] text-[#0090a0]", label: "Claimed" },
  resolved: { dot: "bg-teal-accent", pill: "bg-teal-accent text-white", label: "Returned" },
  rejected: { dot: "bg-danger", pill: "bg-danger text-white", label: "Rejected" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? STYLES.pending!;
  return (
    <span
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.3px] shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] ${s.pill}`}
      aria-label={`Status: ${status}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}
