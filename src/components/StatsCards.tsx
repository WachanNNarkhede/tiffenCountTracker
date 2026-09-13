"use client";

import { CalendarCheck, CopyPlus, Utensils } from "lucide-react";
import {
  useAppSelector,
  selectReceived,
  selectRemaining,
  selectDeliveredDays,
  selectDoubleDays,
} from "@/store/hooks";
import { cx } from "@/lib/utils";

function MealPips({ total, received }: { total: number; received: number }) {
  // One pip per meal in the plan; the first `received` are filled.
  const pips = Array.from({ length: total });
  return (
    <div
      className="flex flex-wrap gap-1.5"
      role="img"
      aria-label={`${received} of ${total} meals received`}
    >
      {pips.map((_, i) => (
        <span
          key={i}
          className={cx(
            "h-3.5 w-3.5 rounded-[5px] transition-colors duration-300",
            i < received ? "bg-saffron" : "bg-line"
          )}
        />
      ))}
    </div>
  );
}

function MiniStat({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone: "saffron" | "leaf" | "clay";
}) {
  const toneClasses = {
    saffron: "bg-saffron-soft text-saffron-deep",
    leaf: "bg-leaf-soft text-leaf",
    clay: "bg-clay-soft text-clay",
  }[tone];
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <span className={cx("grid h-10 w-10 place-items-center rounded-xl", toneClasses)}>
        {icon}
      </span>
      <div>
        <p className="font-display text-2xl font-semibold leading-none text-ink">
          {value}
        </p>
        <p className="mt-1 text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

export function StatsCards() {
  const total = useAppSelector((s) => s.subscription.data?.totalMeals ?? 0);
  const received = useAppSelector(selectReceived);
  const remaining = useAppSelector(selectRemaining);
  const deliveredDays = useAppSelector(selectDeliveredDays);
  const doubleDays = useAppSelector(selectDoubleDays);

  const pct = total > 0 ? Math.round((received / total) * 100) : 0;

  return (
    <section className="space-y-4">
      {/* Hero: meals left + full-plan ledger */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:p-8">
          <div>
            <p className="text-sm text-muted">Meals left in your plan</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-7xl font-semibold leading-none text-ink">
                {remaining}
              </span>
              <span className="font-display text-2xl text-muted">
                / {total}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {received} received · {pct}% of the plan
            </p>
          </div>
          <MealPips total={total} received={received} />
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MiniStat
          icon={<Utensils size={18} />}
          value={received}
          label="Meals received"
          tone="saffron"
        />
        <MiniStat
          icon={<CalendarCheck size={18} />}
          value={deliveredDays}
          label="Days delivered"
          tone="leaf"
        />
        <MiniStat
          icon={<CopyPlus size={18} />}
          value={doubleDays}
          label="Double days"
          tone="clay"
        />
      </div>
    </section>
  );
}
