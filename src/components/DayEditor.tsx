"use client";

import { useState } from "react";
import { Ban, Check, CopyPlus } from "lucide-react";
import { Modal } from "./Modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDelivery, removeDelivery } from "@/store/deliverySlice";
import { prettyDate, isFuture, cx } from "@/lib/utils";
import type { DeliveryCount } from "@/types";

interface Props {
  dateKey: string;
  onClose: () => void;
}

const OPTIONS: {
  value: DeliveryCount;
  label: string;
  hint: string;
  icon: React.ReactNode;
  active: string;
}[] = [
  {
    value: 0,
    label: "Didn't come",
    hint: "No tiffin this day",
    icon: <Ban size={18} />,
    active: "border-clay bg-clay-soft text-clay",
  },
  {
    value: 1,
    label: "Once",
    hint: "One meal — the usual",
    icon: <Check size={18} />,
    active: "border-leaf bg-leaf-soft text-leaf",
  },
  {
    value: 2,
    label: "Twice",
    hint: "Two meals (counts as 2)",
    icon: <CopyPlus size={18} />,
    active: "border-saffron bg-saffron-soft text-saffron-deep",
  },
];

export function DayEditor({ dateKey, onClose }: Props) {
  const dispatch = useAppDispatch();
  const subscriptionId = useAppSelector((s) => s.subscription.data?._id);
  const existing = useAppSelector((s) =>
    s.deliveries.items.find((d) => d.date === dateKey)
  );
  const [count, setCount] = useState<DeliveryCount>(existing?.count ?? 1);
  const [note, setNote] = useState(existing?.note ?? "");
  const saving = useAppSelector((s) => s.deliveries.saving === dateKey);
  const future = isFuture(dateKey);

  async function save() {
    if (!subscriptionId || future) return;
    await dispatch(setDelivery({ subscriptionId, date: dateKey, count, note }));
    onClose();
  }

  async function clear() {
    if (!existing) return;
    await dispatch(removeDelivery(existing));
    onClose();
  }

  return (
    <Modal title={prettyDate(dateKey)} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2.5">
          {OPTIONS.map((opt) => {
            const selected = count === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setCount(opt.value)}
                className={cx(
                  "flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-4 text-center transition",
                  selected
                    ? opt.active
                    : "border-line bg-paper text-muted hover:border-ink/20"
                )}
              >
                {opt.icon}
                <span className="text-sm font-medium leading-tight">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted">
          {OPTIONS.find((o) => o.value === count)?.hint}
        </p>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">
            Note <span className="font-normal text-muted">(optional)</span>
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. extra sabzi, arrived late"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-ink placeholder:text-muted/70 focus:border-saffron focus:bg-surface"
          />
        </label>

        {future && (
          <p className="text-center text-xs text-clay">
            You can only log meals for today or earlier.
          </p>
        )}

        <button
          onClick={save}
          disabled={saving || future}
          className="w-full rounded-xl bg-ink py-3 font-medium text-paper transition hover:bg-ink/90 disabled:opacity-60"
        >
          {saving ? "Saving…" : existing ? "Update" : "Save"}
        </button>

        {existing && (
          <button
            onClick={clear}
            disabled={saving}
            className="w-full rounded-xl py-2 text-sm font-medium text-clay transition hover:bg-clay-soft disabled:opacity-60"
          >
            Remove this entry
          </button>
        )}
      </div>
    </Modal>
  );
}
