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
  updateDoc,
  where,
} from "firebase/firestore";
import type { QueryConstraint } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { DEMO_ITEMS } from "./demo-data";
import type {
  AppNotification,
  AppUser,
  Claim,
  ClaimStatus,
  Item,
  ItemFilters,
  ItemStatus,
  ItemType,
  SavedKeyword,
} from "./types";

const LS_ITEMS = "boomerang_items_v2";
const LS_CLAIMS = "boomerang_claims_v2";
const LS_KEYWORDS = "boomerang_keywords_v2";
const LS_NOTIFS = "boomerang_notifs_v2";

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
  itemId: string,
  proof: string,
  contactNote: string | undefined,
  claimant: AppUser,
): Promise<void> {
  const now = new Date().toISOString();
  if (!isFirebaseConfigured || !db) {
    ensureSeeded();
    const claims = readLS<Claim[]>(LS_CLAIMS, []);
    claims.push({
      id: `claim-${Date.now()}`,
      itemId,
      claimantId: claimant.uid,
      claimantName: claimant.name,
      proof,
      contactNote,
      status: "pending",
      createdAt: now,
    });
    writeLS(LS_CLAIMS, claims);
    const all = readLS<Item[]>(LS_ITEMS, DEMO_ITEMS);
    writeLS(
      LS_ITEMS,
      all.map((i) => (i.id === itemId ? { ...i, status: "claimed" as ItemStatus, updatedAt: now } : i)),
    );
    return;
  }
  await addDoc(collection(db, "items", itemId, "claims"), {
    claimantId: claimant.uid,
    claimantName: claimant.name,
    proof,
    contactNote: contactNote ?? "",
    status: "pending",
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "items", itemId), { status: "claimed", updatedAt: serverTimestamp() });
}

export async function decideClaim(itemId: string, claimId: string, decision: "accepted" | "rejected"): Promise<void> {
  const status: ClaimStatus = decision === "accepted" ? "accepted" : "rejected";
  if (!isFirebaseConfigured || !db) {
    ensureSeeded();
    const claims = readLS<Claim[]>(LS_CLAIMS, []);
    const next = claims.map((c) => (c.id === claimId ? { ...c, status } : c.id && c.itemId === itemId && decision === "accepted" ? { ...c, status: "rejected" as ClaimStatus } : c));
    writeLS(LS_CLAIMS, decision === "accepted" ? next.map((c) => (c.itemId === itemId && c.id !== claimId && c.status === "pending" ? { ...c, status: "rejected" as ClaimStatus } : c)) : next);
    return;
  }
  await updateDoc(doc(db, "items", itemId, "claims", claimId), { status });
  if (decision === "accepted") {
    const csnap = await getDocs(collection(db, "items", itemId, "claims"));
    await Promise.all(
      csnap.docs
        .filter((d) => d.id !== claimId && (d.data().status === "pending"))
        .map((d) => updateDoc(d.ref, { status: "rejected" })),
    );
  }
}

export async function setItemStatus(itemId: string, status: ItemStatus): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    ensureSeeded();
    const all = readLS<Item[]>(LS_ITEMS, DEMO_ITEMS);
    writeLS(
      LS_ITEMS,
      all.map((i) => (i.id === itemId ? { ...i, status, updatedAt: new Date().toISOString() } : i)),
    );
    return;
  }
  await updateDoc(doc(db, "items", itemId), { status, updatedAt: serverTimestamp() });
}

/* ------------------------------ keywords --------------------------------- */

export async function listKeywords(userId: string): Promise<SavedKeyword[]> {
  if (!isFirebaseConfigured || !db) {
    ensureSeeded();
    return readLS<SavedKeyword[]>(LS_KEYWORDS, []).filter((k) => k.userId === userId);
  }
  const snap = await getDocs(query(collection(db, "keywords"), where("userId", "==", userId)));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SavedKeyword, "id">) }));
}

export async function addKeyword(userId: string, keyword: string): Promise<void> {
  const clean = keyword.trim().toLowerCase();
  if (!clean) return;
  if (!isFirebaseConfigured || !db) {
    ensureSeeded();
    const all = readLS<SavedKeyword[]>(LS_KEYWORDS, []);
    if (all.some((k) => k.userId === userId && k.keyword === clean)) return;
    writeLS(LS_KEYWORDS, [...all, { id: `kw-${Date.now()}`, userId, keyword: clean, createdAt: new Date().toISOString() }]);
    return;
  }
  await addDoc(collection(db, "keywords"), { userId, keyword: clean, createdAt: serverTimestamp() });
}

export async function removeKeyword(id: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    ensureSeeded();
    writeLS(LS_KEYWORDS, readLS<SavedKeyword[]>(LS_KEYWORDS, []).filter((k) => k.id !== id));
    return;
  }
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "keywords", id));
}

/* ---------------------------- notifications ------------------------------- */

function fanOutMockNotifications(item: Item) {
  const keywords = readLS<SavedKeyword[]>(LS_KEYWORDS, []);
  const notifs = readLS<AppNotification[]>(LS_NOTIFS, []);
  const hay = `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
  const fresh = keywords
    .filter((k) => k.userId !== item.ownerId && hay.includes(k.keyword.toLowerCase()))
    .filter((k) => !notifs.some((n) => n.userId === k.userId && n.itemId === item.id && n.keyword === k.keyword))
    .map((k) => ({
      id: `notif-${Date.now()}-${k.id}`,
      userId: k.userId,
      itemId: item.id,
      keyword: k.keyword,
      message: `Match for “${k.keyword}”: ${item.title}`,
      read: false,
      createdAt: new Date().toISOString(),
    }));
  if (fresh.length) writeLS(LS_NOTIFS, [...fresh, ...notifs]);
}

export async function listNotifications(userId: string): Promise<{ notifications: AppNotification[]; unread: number }> {
  if (!isFirebaseConfigured || !db) {
    ensureSeeded();
    // Lazy match: scan published items against my keywords so demo alerts appear.
    const items = readLS<Item[]>(LS_ITEMS, DEMO_ITEMS).filter((i) => PUBLIC_STATUSES.includes(i.status));
    const keywords = readLS<SavedKeyword[]>(LS_KEYWORDS, []).filter((k) => k.userId === userId);
    let notifs = readLS<AppNotification[]>(LS_NOTIFS, []);
    const fresh = keywords.flatMap((k) => {
      const hay = (kw: string) => kw.toLowerCase().includes(k.keyword.toLowerCase());
      return items
        .filter((i) => hay(`${i.title} ${i.description} ${i.tags.join(" ")}`) && i.ownerId !== userId)
        .filter((i) => !notifs.some((n) => n.userId === userId && n.itemId === i.id && n.keyword === k.keyword))
        .map((i) => ({
          id: `notif-${Date.now()}-${i.id}-${k.id}`,
          userId,
          itemId: i.id,
          keyword: k.keyword,
          message: `Match for “${k.keyword}”: ${i.title}`,
          read: false,
          createdAt: new Date().toISOString(),
        }));
    });
    if (fresh.length) {
      notifs = [...fresh, ...notifs];
      writeLS(LS_NOTIFS, notifs);
    }
    const mine = notifs.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { notifications: mine, unread: mine.filter((n) => !n.read).length };
  }
  const snap = await getDocs(query(collection(db, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(50)));
  const notifications = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppNotification, "id">) }));
  return { notifications, unread: notifications.filter((n) => !n.read).length };
}

export async function markAllRead(userId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    ensureSeeded();
    writeLS(
      LS_NOTIFS,
      readLS<AppNotification[]>(LS_NOTIFS, []).map((n) => (n.userId === userId ? { ...n, read: true } : n)),
    );
    return;
  }
  const snap = await getDocs(query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false)));
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
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
