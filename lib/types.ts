export type Role = "user" | "admin";
export type ItemType = "lost" | "found";
export type ItemStatus = "pending" | "published" | "claimed" | "resolved" | "rejected";
export type ClaimStatus = "pending" | "accepted" | "rejected";

/** Authenticated app user (Firebase Auth UID + Firestore profile). */
export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: Role;
}

/** Firestore doc: items/{id} */
export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category: string;
  location: string;
  eventDate: string; // YYYY-MM-DD
  tags: string[];
  imageUrl?: string;
  status: ItemStatus;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

/** Firestore doc: items/{itemId}/claims/{claimId} */
export interface Claim {
  id: string;
  itemId: string;
  claimantId: string;
  claimantName: string;
  proof: string;
  contactNote?: string;
  status: ClaimStatus;
  createdAt: string;
}

/** Firestore doc: keywords/{id} */
export interface SavedKeyword {
  id: string;
  userId: string;
  keyword: string;
  createdAt: string;
}

/** Firestore doc: notifications/{id} */
export interface AppNotification {
  id: string;
  userId: string;
  itemId: string;
  keyword: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ItemFilters {
  query?: string;
  category?: string;
  location?: string;
  from?: string;
  to?: string;
  tags?: string;
  type?: "" | ItemType;
  status?: ItemStatus | "";
  ownerId?: string;
}

export const CATEGORIES = [
  "electronics",
  "clothing",
  "books",
  "keys",
  "id-cards",
  "bags",
  "jewelry",
  "sports",
  "other",
] as const;

export const CATEGORY_META: Record<string, { label: string; icon: string; tint: string }> = {
  electronics: { label: "Electronics", icon: "💻", tint: "bg-sky-100 text-sky-800" },
  clothing: { label: "Clothing", icon: "👕", tint: "bg-violet-100 text-violet-800" },
  books: { label: "Books", icon: "📚", tint: "bg-amber-100 text-amber-800" },
  keys: { label: "Keys", icon: "🔑", tint: "bg-yellow-100 text-yellow-800" },
  "id-cards": { label: "ID cards", icon: "🪪", tint: "bg-cyan-100 text-cyan-800" },
  bags: { label: "Bags", icon: "🎒", tint: "bg-orange-100 text-orange-800" },
  jewelry: { label: "Jewelry", icon: "💍", tint: "bg-pink-100 text-pink-800" },
  sports: { label: "Sports", icon: "⚽", tint: "bg-emerald-100 text-emerald-800" },
  other: { label: "Other", icon: "📦", tint: "bg-zinc-200 text-zinc-700" },
};
