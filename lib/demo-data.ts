import type { Item } from "./types";

const now = new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

/** Demo catalog shown when Firebase env vars are not set. Replaced by Firestore once configured. */
export const DEMO_ITEMS: Item[] = [
  {
    id: "demo-1",
    type: "lost",
    title: "Black leather wallet with brass clasp",
    description:
      "Lost near the Central Library 2nd floor on Tuesday afternoon. Contains a student ID (Maya R.), a metro card, and a small photo. No cash. Happy to meet at the front desk with proof.",
    category: "other",
    location: "Central Library, 2nd floor",
    eventDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    tags: ["wallet", "leather", "black"],
    status: "published",
    ownerId: "demo-user-maya",
    ownerName: "Maya R.",
    createdAt: daysAgo(2),
    updatedAt: now,
  },
  {
    id: "demo-2",
    type: "found",
    title: "Silver MacBook charger (USB-C, 67W)",
    description:
      "Found plugged in at Block A lecture hall, row 5, after the morning session. Has a small blue sticker on the brick. Claim with the sticker detail.",
    category: "electronics",
    location: "Block A, Lecture Hall 2",
    eventDate: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
    tags: ["charger", "macbook", "usb-c"],
    status: "published",
    ownerId: "demo-user-sam",
    ownerName: "Sam K.",
    createdAt: daysAgo(1),
    updatedAt: now,
  },
  {
    id: "demo-3",
    type: "found",
    title: "Set of 3 keys with red fob",
    description:
      "Found at the sports complex entrance gate. Three keys on a ring with a red rubber fob and a bottle opener. Handed a description to security.",
    category: "keys",
    location: "Sports Complex, gate",
    eventDate: new Date().toISOString().slice(0, 10),
    tags: ["keys", "red", "fob"],
    status: "claimed",
    ownerId: "demo-user-sam",
    ownerName: "Sam K.",
    createdAt: daysAgo(1),
    updatedAt: now,
  },
  {
    id: "demo-4",
    type: "lost",
    title: "Casio fx-991EX calculator",
    description:
      "Lost during the physics midterm in Room 204. Name sticker 'ARIF' on the back cover, small scratch on the display edge. Needed urgently for finals.",
    category: "electronics",
    location: "Room 204, Science Block",
    eventDate: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
    tags: ["calculator", "casio", "exam"],
    status: "published",
    ownerId: "demo-user-arif",
    ownerName: "Arif H.",
    createdAt: daysAgo(5),
    updatedAt: now,
  },
  {
    id: "demo-5",
    type: "found",
    title: "Navy Herschel backpack",
    description:
      "Left on the campus shuttle (route 2, evening). Contains notebooks and a water bottle. Currently held at the security office — bring ID + describe a notebook to claim.",
    category: "bags",
    location: "Campus Shuttle, Route 2",
    eventDate: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
    tags: ["backpack", "herschel", "navy"],
    status: "published",
    ownerId: "demo-user-admin",
    ownerName: "Security Office",
    createdAt: daysAgo(3),
    updatedAt: now,
  },
  {
    id: "demo-6",
    type: "lost",
    title: "Student ID card — Nabila T.",
    description:
      "Lost somewhere between the cafeteria and the dorm gate. ID in a clear sleeve with a sunflower sticker. Please drop at the security office if found.",
    category: "id-cards",
    location: "Cafeteria → Dorm gate",
    eventDate: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10),
    tags: ["id", "student-card", "sunflower"],
    status: "resolved",
    ownerId: "demo-user-nabila",
    ownerName: "Nabila T.",
    createdAt: daysAgo(4),
    updatedAt: now,
  },
];

export const DEMO_USERS = [
  { uid: "demo-user-admin", name: "Security Office", email: "admin@campus.edu", password: "Admin123!", role: "admin" as const },
  { uid: "demo-user-maya", name: "Maya R.", email: "maya@campus.edu", password: "Password123!", role: "user" as const },
  { uid: "demo-user-sam", name: "Sam K.", email: "sam@campus.edu", password: "Password123!", role: "user" as const },
];
