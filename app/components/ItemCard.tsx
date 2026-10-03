import Link from "next/link";
import { CATEGORY_META } from "@/lib/types";
import type { Item } from "@/lib/types";
import StatusBadge from "./StatusBadge";

export default function ItemCard({ item }: { item: Item }) {
  const meta = CATEGORY_META[item.category] ?? CATEGORY_META.other!;
  return (
    <article className="card card-hover group flex w-full flex-col overflow-hidden sm:max-w-[324px]">
      <div className="relative h-44 bg-[radial-gradient(circle,rgba(124,59,237,0.15)_0%,rgba(0,0,0,0)_70%),linear-gradient(135deg,#f4f2f8,#e6f7f2)]">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-semibold uppercase tracking-[0.3px] text-primary/60" aria-hidden>
            {meta.icon}
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className={item.type === "lost" ? "badge-lost" : "badge-found"}>{item.type}</span>
          <StatusBadge status={item.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span className="btn-tint !h-9 !text-[12px] !font-semibold uppercase !tracking-[0.3px]">
            {meta.label}
          </span>
        </div>
        <h3 className="text-base font-semibold leading-[1.5] tracking-[-0.4px] text-ink">
          <Link href={`/items/${item.id}`} className="transition-colors group-hover:text-primary group-hover:underline">
            {item.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm leading-[1.63] text-body">{item.description}</p>
        <div className="mt-auto space-y-2 pt-2">
          <p className="flex items-center gap-1.5 text-xs font-normal leading-[1.33] text-body">
            <span className="truncate">{item.location}</span>
            <span aria-hidden className="text-hairline">·</span>
            {item.eventDate}
          </p>
          <div className="flex items-center justify-between border-t border-hairline pt-3">
            <span className="text-xs font-normal text-body">By {item.ownerName}</span>
            <Link
              href={`/items/${item.id}`}
              className="text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5 hover:underline"
              aria-label={`View entry ${item.title}`}
            >
              View →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
