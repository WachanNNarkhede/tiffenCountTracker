"use client";

import { Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeDelivery } from "@/store/deliverySlice";
import { prettyDate, cx } from "@/lib/utils";
import type { Delivery } from "@/types";

const CHIP: Record<number, { label: string; className: string }> = {
  0: { label: "Didn't come", className: "bg-clay-soft text-clay" },
  1: { label: "Once", className: "bg-leaf-soft text-leaf" },
  2: { label: "Twice ×2", className: "bg-saffron-soft text-saffron-deep" },
};

export function DeliveryList({ onSelect }: { onSelect: (d: string) => void }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.deliveries.items);

  // Most recent first.
  const rows = [...items].sort((a, b) => b.date.localeCompare(a.date));

  async function remove(delivery: Delivery) {
    await dispatch(removeDelivery(delivery));
  }

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
      <h2 className="mb-4 font-display text-xl font-semibold text-ink">
        Delivery log
      </h2>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-paper px-4 py-8 text-center text-sm text-muted">
          Nothing logged yet. Tap a day on the calendar to mark your first
          delivery.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((d) => (
            <li
              key={d._id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <button
                onClick={() => onSelect(d.date)}
                className="flex-1 text-left"
              >
                <p className="font-medium text-ink">{prettyDate(d.date)}</p>
                {d.note ? (
                  <p className="mt-0.5 text-sm text-muted">{d.note}</p>
                ) : null}
              </button>
              <span
                className={cx(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  CHIP[d.count]?.className
                )}
              >
                {CHIP[d.count]?.label}
              </span>
              <button
                onClick={() => remove(d)}
                aria-label={`Remove ${prettyDate(d.date)}`}
                className="rounded-lg p-2 text-muted transition hover:bg-clay-soft hover:text-clay"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
