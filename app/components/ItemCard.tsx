import Link from "next/link";
import { CATEGORY_META } from "@/lib/types";
import type { Item } from "@/lib/types";
import StatusBadge from "./StatusBadge";

export default function ItemCard({ item }: { item: Item }) {
  const meta = CATEGORY_META[item.category] ?? CATEGORY_META.other!;
  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <div className="relative h-44 bg-gradient-to-br from-indigo-100 via-sky-50 to-teal-50">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl" aria-hidden>
            {meta.icon}
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
              item.type === "lost" ? "bg-rose-500 text-white" : "bg-teal-500 text-white"
            }`}
          >
            {item.type}
          </span>
          <StatusBadge status={item.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          <span className={`rounded-full px-2 py-0.5 ${meta.tint}`}>
            {meta.icon} {meta.label}
          </span>
        </div>
        <h3 className="text-[15px] font-extrabold leading-snug tracking-tight">
          <Link href={`/items/${item.id}`} className="transition-colors group-hover:text-indigo-700">
            {item.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{item.description}</p>
        <div className="mt-auto space-y-2 pt-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span aria-hidden>📍</span> <span className="truncate">{item.location}</span>
            <span aria-hidden className="text-slate-300">·</span>
            <span aria-hidden>📅</span> {item.eventDate}
          </p>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-slate-400">by {item.ownerName}</span>
            <Link
              href={`/items/${item.id}`}
              className="text-xs font-bold text-indigo-600 transition-transform group-hover:translate-x-0.5"
              aria-label={`View ${item.title}`}
            >
              View →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
