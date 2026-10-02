import Link from "next/link";
import { CATEGORY_META } from "@/lib/types";
import type { Item } from "@/lib/types";
import StatusBadge from "./StatusBadge";

export default function ItemCard({ item }: { item: Item }) {
  const meta = CATEGORY_META[item.category] ?? CATEGORY_META.other!;
  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <div className="relative h-44 bg-gradient-to-br from-[#e8e0cb] via-[#f6f1e6] to-[#e8cf7a]/40">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-6xl text-[#0e2a47]/70" aria-hidden>
            {meta.icon}
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span
            className={`rounded px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-white ${
              item.type === "lost" ? "bg-[#7a1f1f]" : "bg-[#1f5c3d]"
            }`}
          >
            {item.type}
          </span>
          <StatusBadge status={item.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#8a6d1c]">
          <span className="border-b border-[#c19a2e] pb-0.5">
            {meta.icon} {meta.label}
          </span>
        </div>
        <h3 className="font-display text-lg font-bold leading-snug text-[#0e2a47]">
          <Link href={`/items/${item.id}`} className="transition-colors group-hover:text-[#1d4a7a] group-hover:underline">
            {item.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
        <div className="mt-auto space-y-2 pt-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span aria-hidden>📍</span> <span className="truncate">{item.location}</span>
            <span aria-hidden className="text-slate-300">·</span>
            <span aria-hidden>📅</span> {item.eventDate}
          </p>
          <div className="flex items-center justify-between border-t border-[#e2d9c2] pt-3">
            <span className="text-xs font-semibold text-slate-500">Recorded by {item.ownerName}</span>
            <Link
              href={`/items/${item.id}`}
              className="font-display text-sm font-bold text-[#0e2a47] underline decoration-[#c19a2e] decoration-2 underline-offset-4 transition-transform group-hover:translate-x-0.5"
              aria-label={`View registry entry ${item.title}`}
            >
              View entry →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
