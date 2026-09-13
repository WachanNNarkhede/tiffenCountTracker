// Data-access layer with two interchangeable backends:
//
//   NEXT_PUBLIC_DATA_BACKEND=local  -> browser localStorage (no DB needed)
//   NEXT_PUBLIC_DATA_BACKEND=api    -> existing Next API routes + MongoDB
//
// Default is "local" so the app works without a database. When your MongoDB
// is reachable, set NEXT_PUBLIC_DATA_BACKEND=api in .env(.local) and restart.
//
// Both backends return the SAME shapes the Redux slices already expect, so no
// reducer changes are needed when you switch.

import type {
  Subscription,
  NewSubscriptionInput,
  Delivery,
  DeliveryInput,
  DeliveryCount,
} from "@/types";
import { isFuture } from "@/lib/utils";

const FUTURE_ERROR = "You can only log meals for today or earlier.";

const BACKEND = (
  process.env.NEXT_PUBLIC_DATA_BACKEND ?? "local"
).toLowerCase();

/** Result of upserting/removing a single delivery — mirrors the API's JSON. */
export interface SetDeliveryResult {
  delivery?: Delivery;
  deleted?: boolean;
  date?: string;
}

export interface DataClient {
  getSubscription(): Promise<Subscription | null>;
  createSubscription(input: NewSubscriptionInput): Promise<Subscription>;
  updateSubscription(
    input: Partial<NewSubscriptionInput>
  ): Promise<Subscription>;
  getDeliveries(subscriptionId: string): Promise<Delivery[]>;
  /** Upsert a day. count 0 = "Didn't come" and is kept as a real record. */
  setDelivery(input: DeliveryInput): Promise<SetDeliveryResult>;
  /** Remove a logged day entirely (back to "not logged"). */
  removeDelivery(delivery: Delivery): Promise<{ deleted: true; date: string }>;
}

// ---------------------------------------------------------------------------
// API backend — the original behaviour, hitting the Next.js routes.
// ---------------------------------------------------------------------------

async function parse(res: Response) {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

const apiClient: DataClient = {
  async getSubscription() {
    const json = await parse(await fetch("/api/subscription"));
    return json.subscription as Subscription | null;
  },
  async createSubscription(input) {
    const json = await parse(
      await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
    return json.subscription as Subscription;
  },
  async updateSubscription(input) {
    const json = await parse(
      await fetch("/api/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
    return json.subscription as Subscription;
  },
  async getDeliveries(subscriptionId) {
    const json = await parse(
      await fetch(`/api/deliveries?subscriptionId=${subscriptionId}`)
    );
    return json.deliveries as Delivery[];
  },
  async setDelivery(input) {
    if (isFuture(String(input.date || "").slice(0, 10))) {
      throw new Error(FUTURE_ERROR);
    }
    const json = await parse(
      await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
    return json as SetDeliveryResult;
  },
  async removeDelivery(delivery) {
    await parse(
      await fetch(`/api/deliveries/${delivery._id}`, { method: "DELETE" })
    );
    return { deleted: true, date: delivery.date };
  },
};

// ---------------------------------------------------------------------------
// Local backend — persists to localStorage. Same data shapes as the API.
// ---------------------------------------------------------------------------

const SUBS_KEY = "tiffin:subscriptions";
const DELIVERIES_KEY = "tiffin:deliveries";

function newId(): string {
  // crypto.randomUUID is available in modern browsers; fall back just in case.
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

const localClient: DataClient = {
  async getSubscription() {
    const subs = read<Subscription[]>(SUBS_KEY, []);
    const active = subs
      .filter((s) => s.active)
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return active[0] ?? null;
  },

  async createSubscription(input) {
    const totalMeals = Number(input.totalMeals);
    if (!Number.isFinite(totalMeals) || totalMeals < 1) {
      throw new Error("Enter a meal count of at least 1.");
    }
    const startDate = String(input.startDate || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      throw new Error("Pick a valid start date.");
    }

    const subs = read<Subscription[]>(SUBS_KEY, []);
    // Deactivate any previous plans, like the API's updateMany does.
    subs.forEach((s) => (s.active = false));

    const created: Subscription = {
      _id: newId(),
      name: String(input.name || "My tiffin plan").trim(),
      totalMeals,
      startDate,
      active: true,
      createdAt: new Date().toISOString(),
    };
    subs.push(created);
    write(SUBS_KEY, subs);
    return created;
  },

  async updateSubscription(input) {
    const subs = read<Subscription[]>(SUBS_KEY, []);
    const active = subs
      .filter((s) => s.active)
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))[0];
    if (!active) throw new Error("No active plan to update.");

    if (typeof input.name === "string") active.name = input.name.trim();
    if (input.totalMeals != null) {
      const n = Number(input.totalMeals);
      if (!Number.isFinite(n) || n < 1) {
        throw new Error("Enter a meal count of at least 1.");
      }
      active.totalMeals = n;
    }
    if (typeof input.startDate === "string") {
      const d = input.startDate.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        throw new Error("Pick a valid start date.");
      }
      active.startDate = d;
    }

    write(SUBS_KEY, subs);
    return active;
  },

  async getDeliveries(subscriptionId) {
    const all = read<Delivery[]>(DELIVERIES_KEY, []);
    return all
      .filter((d) => d.subscriptionId === subscriptionId)
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async setDelivery(input) {
    const subscriptionId = String(input.subscriptionId || "");
    const date = String(input.date || "").slice(0, 10);
    const count = Number(input.count) as DeliveryCount;
    const note = typeof input.note === "string" ? input.note.trim() : "";

    if (!subscriptionId) throw new Error("subscriptionId is required.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date.");
    if (isFuture(date)) throw new Error(FUTURE_ERROR);
    if (![0, 1, 2].includes(count)) {
      throw new Error("Count must be 0, 1, or 2.");
    }

    const all = read<Delivery[]>(DELIVERIES_KEY, []);
    const idx = all.findIndex(
      (d) => d.subscriptionId === subscriptionId && d.date === date
    );

    // count 0 = "Didn't come" — kept as a real record so it displays. Use
    // removeDelivery() to clear a day back to "not logged".
    let delivery: Delivery;
    if (idx >= 0) {
      delivery = { ...all[idx], count, note };
      all[idx] = delivery;
    } else {
      delivery = { _id: newId(), subscriptionId, date, count, note };
      all.push(delivery);
    }
    write(DELIVERIES_KEY, all);
    return { delivery };
  },

  async removeDelivery(delivery) {
    const all = read<Delivery[]>(DELIVERIES_KEY, []);
    const next = all.filter((d) => d._id !== delivery._id);
    write(DELIVERIES_KEY, next);
    return { deleted: true, date: delivery.date };
  },
};

export const dataClient: DataClient =
  BACKEND === "api" ? apiClient : localClient;

export const activeBackend = BACKEND === "api" ? "api" : "local";
