"use client";

import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { createSubscription, updateSubscription } from "@/store/subscriptionSlice";
import { fetchDeliveries } from "@/store/deliverySlice";
import { todayKey } from "@/lib/utils";
import type { Subscription } from "@/types";

interface Props {
  /** When editing an existing plan; omit for first-time setup. */
  existing?: Subscription;
  onDone?: () => void;
}

export function SubscriptionSetup({ existing, onDone }: Props) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(existing?.name ?? "My tiffin plan");
  const [totalMeals, setTotalMeals] = useState(existing?.totalMeals ?? 30);
  const [startDate, setStartDate] = useState(existing?.startDate ?? todayKey());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(existing);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (isEdit) {
        await dispatch(
          updateSubscription({ name, totalMeals, startDate })
        ).unwrap();
      } else {
        const sub = await dispatch(
          createSubscription({ name, totalMeals, startDate })
        ).unwrap();
        await dispatch(fetchDeliveries(sub._id));
      }
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {!isEdit && (
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-saffron-soft text-saffron-deep">
            <UtensilsCrossed size={20} />
          </span>
          <div>
            <p className="font-display text-lg font-semibold leading-tight">
              Set up your plan
            </p>
            <p className="text-sm text-muted">
              Tell me about your subscription to start tracking.
            </p>
          </div>
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">
          Plan name
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sharma Tiffin Service"
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-ink placeholder:text-muted/70 focus:border-saffron focus:bg-surface"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">
            Meals in plan
          </span>
          <input
            type="number"
            min={1}
            value={totalMeals}
            onChange={(e) => setTotalMeals(Number(e.target.value))}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-ink focus:border-saffron focus:bg-surface"
          />
          <span className="mt-1 block text-xs text-muted">
            A double day uses 2 meals.
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">
            Start date
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-ink focus:border-saffron focus:bg-surface"
          />
        </label>
      </div>

      {error && (
        <p className="rounded-xl bg-clay-soft px-3.5 py-2.5 text-sm text-clay">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={busy}
        className="w-full rounded-xl bg-ink py-3 font-medium text-paper transition hover:bg-ink/90 disabled:opacity-60"
      >
        {busy ? "Saving…" : isEdit ? "Save changes" : "Start tracking"}
      </button>
    </div>
  );
}
