"use client";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import type { QueryConstraint } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { DEMO_ITEMS } from "./demo-data";
import type {
  AppNotification,
  AppUser,
  Claim,
  Item,
  ItemFilters,
  ItemStatus,
  ItemType,
  SavedKeyword,
} from "./types";

const LS_ITEMS = "boomerang_items_v2";
// Reserved for Tasks 3–4 (currently stubbed below) — do not delete.
const LS_CLAIMS = "boomerang_claims_v2";
const LS_KEYWORDS = "boomerang_keywords_v2";
const LS_NOTIFS = "boomerang_notifs_v2";
void LS_CLAIMS;
void LS_KEYWORDS;
void LS_NOTIFS;

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(LS_ITEMS)) writeLS(LS_ITEMS, DEMO_ITEMS);
  if (!localStorage.getItem(LS_CLAIMS)) writeLS(LS_CLAIMS, []);
  if (!localStorage.getItem(LS_KEYWORDS)) writeLS(LS_KEYWORDS, []);
  if (!localStorage.getItem(LS_NOTIFS)) writeLS(LS_NOTIFS, []);
}

function matchesFilters(item: Item, f: ItemFilters): boolean {
  if (f.type && item.type !== f.type) return false;
  if (f.category && item.category !== f.category) return false;
  if (f.status && item.status !== f.status) return false;
  if (f.ownerId && item.ownerId !== f.ownerId) return false;
  if (f.location && !item.location.toLowerCase().includes(f.location.toLowerCase())) return false;
  if (f.from && item.eventDate < f.from) return false;
  if (f.to && item.eventDate > f.to) return false;
  if (f.tags) {
    const wanted = f.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const hay = item.tags.map((t) => t.toLowerCase());
    if (!wanted.every((w) => hay.some((h) => h.includes(w)))) return false;
  }
  if (f.query) {
    const words = f.query.toLowerCase().split(/\s+/).filter(Boolean);
    const hay = `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
    if (!words.every((w) => hay.includes(w))) return false;
  }
  return true;
}

const PUBLIC_STATUSES: ItemStatus[] = ["published", "claimed", "resolved"];

/* ------------------------------ mock layer ------------------------------ */

function mockList(f: ItemFilters): { items: Item[]; total: number } {
  ensureSeeded();
  const all = readLS<Item[]>(LS_ITEMS, DEMO_ITEMS);
  const visible = f.ownerId || f.status ? all : all.filter((i) => PUBLIC_STATUSES.includes(i.status));
  const items = visible.filter((i) => matchesFilters(i, f)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { items, total: items.length };
}

function mockGet(id: string): { item: Item; claims: Claim[] } | null {
  ensureSeeded();
  const all = readLS<Item[]>(LS_ITEMS, DEMO_ITEMS);
  const item = all.find((i) => i.id === id) ?? null;
  if (!item) return null;
  const claims = readLS<Claim[]>(LS_CLAIMS, []).filter((c) => c.itemId === id);
  return { item, claims };
}

/* ------------------------------- public API ------------------------------ */

export async function fetchItems(filters: ItemFilters = {}): Promise<{ items: Item[]; total: number }> {
  if (!isFirebaseConfigured || !db) return mockList(filters);
  try {
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc"), limit(100)];
    if (filters.type) constraints.unshift(where("type", "==", filters.type));
    if (filters.category) constraints.unshift(where("category", "==", filters.category));
    if (filters.status) constraints.unshift(where("status", "==", filters.status));
    else if (!filters.ownerId) constraints.unshift(where("status", "in", PUBLIC_STATUSES));
    if (filters.ownerId) constraints.unshift(where("ownerId", "==", filters.ownerId));
    const snap = await getDocs(query(collection(db, "items"), ...constraints));
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Item, "id">) }));
    const filtered = items.filter((i) => matchesFilters(i, filters));
    return { items: filtered, total: filtered.length };
  } catch {
    return mockList(filters);
  }
}

export async function getItemDetail(id: string): Promise<{ item: Item; claims: Claim[] } | null> {
  if (!isFirebaseConfigured || !db) return mockGet(id);
  const ref = doc(db, "items", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return mockGet(id);
  const item = { id: snap.id, ...(snap.data() as Omit<Item, "id">) };
  const csnap = await getDocs(collection(db, "items", id, "claims"));
  const claims = csnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Claim, "id">) }));
  return { item, claims };
}

export interface NewItemInput {
  type: ItemType;
  title: string;
  description: string;
  category: string;
  location: string;
  eventDate: string;
  tags: string[];
  imageUrl?: string;
}

export async function createItem(input: NewItemInput, owner: AppUser): Promise<Item> {
  const now = new Date().toISOString();
  if (!isFirebaseConfigured || !db) {
    ensureSeeded();
    const all = readLS<Item[]>(LS_ITEMS, DEMO_ITEMS);
    const item: Item = {
      ...input,
      id: `item-${Date.now()}`,
      status: owner.role === "admin" ? "published" : "pending",
      ownerId: owner.uid,
      ownerName: owner.name,
      createdAt: now,
      updatedAt: now,
    };
    writeLS(LS_ITEMS, [item, ...all]);
    fanOutMockNotifications(item);
    return item;
  }
  const payload = {
    ...input,
    imageUrl: input.imageUrl ?? "",
    status: owner.role === "admin" ? "published" : "pending",
    ownerId: owner.uid,
    ownerName: owner.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "items"), payload);
  return {
    ...input,
    id: ref.id,
    status: owner.role === "admin" ? "published" : "pending",
    ownerId: owner.uid,
    ownerName: owner.name,
    createdAt: now,
    updatedAt: now,
  };
}

export async function submitClaim(
  _itemId: string,
  _proof: string,
  _contactNote: string | undefined,
  _claimant: AppUser,
): Promise<void> {
  // TODO (Tausiful Islam — todo.md Task 3): implement claim submission.
  // Expected behavior: validate proof (min 10 chars), require login, add
  // `items/{id}/claims/*` with status "pending" + set item → "claimed".
  // Support demo mode (localStorage LS_CLAIMS/LS_ITEMS) + Firestore path.
  // Delete this throw and restore the previous implementation as reference.
  void _itemId;
  void _proof;
  void _contactNote;
  void _claimant;
  throw new Error("TODO (Tausiful Islam): submitClaim() is not implemented yet — see todo.md Task 3.");
}

export async function decideClaim(_itemId: string, _claimId: string, _decision: "accepted" | "rejected"): Promise<void> {
  // TODO (Tausiful Islam — todo.md Task 3): implement claim verification.
  // Accept → claim "accepted", reject competing pendings; reject → claim "rejected".
  // Demo mode (localStorage) + Firestore paths both required.
  void _itemId;
  void _claimId;
  void _decision;
  throw new Error("TODO (Tausiful Islam): decideClaim() is not implemented yet — see todo.md Task 3.");
}

export async function setItemStatus(_itemId: string, _status: ItemStatus): Promise<void> {
  // TODO (Mirza Rafi — todo.md Task 5; used by Tausiful's "Mark as returned" too):
  // implement status transitions (pending→published→claimed→resolved, rejected branches).
  // Demo mode (localStorage LS_ITEMS) + Firestore updateDoc path both required.
  void _itemId;
  void _status;
  throw new Error("TODO (Mirza Rafi): setItemStatus() is not implemented yet — see todo.md Task 5.");
}

/* ------------------------------ keywords --------------------------------- */
// TODO (Mirza Rafi — todo.md Task 4): implement keyword alerts + notifications.
// All functions below currently throw TODO. Expected behavior:
// - keywords: per-user CRUD on `keywords` collection (demo: LS_KEYWORDS), lowercase dedupe.
// - notifications: fan-out on createItem + lazy match on list (demo: LS_NOTIFS),
//   `notifications` collection in Firestore, unread counts, markAllRead.

export async function listKeywords(_userId: string): Promise<SavedKeyword[]> {
  void _userId;
  throw new Error("TODO (Mirza Rafi): listKeywords() is not implemented yet — see todo.md Task 4.");
}

export async function addKeyword(_userId: string, _keyword: string): Promise<void> {
  void _userId;
  void _keyword;
  throw new Error("TODO (Mirza Rafi): addKeyword() is not implemented yet — see todo.md Task 4.");
}

export async function removeKeyword(_id: string): Promise<void> {
  void _id;
  throw new Error("TODO (Mirza Rafi): removeKeyword() is not implemented yet — see todo.md Task 4.");
}

/* ---------------------------- notifications ------------------------------- */

function fanOutMockNotifications(_item: Item) {
  // TODO (Mirza Rafi — todo.md Task 4): re-implement demo fan-out that creates
  // LS_NOTIFS entries for keywords matching the new item. Currently a no-op so
  // reporting items keeps working before Task 4 is done.
  void _item;
  return;
}

export async function listNotifications(_userId: string): Promise<{ notifications: AppNotification[]; unread: number }> {
  // NOTE: Navbar calls this for its unread badge and tolerates the TODO throw
  // (it falls back to 0). Implement per todo.md Task 4.
  void _userId;
  throw new Error("TODO (Mirza Rafi): listNotifications() is not implemented yet — see todo.md Task 4.");
}

export async function markAllRead(_userId: string): Promise<void> {
  void _userId;
  throw new Error("TODO (Mirza Rafi): markAllRead() is not implemented yet — see todo.md Task 4.");
}

/** Ensure a Firestore user profile doc exists (called after sign-in/up). */
export async function ensureUserProfile(user: AppUser): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { name: user.name, email: user.email, role: "user", createdAt: serverTimestamp() });
  }
}
