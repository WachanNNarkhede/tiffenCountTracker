"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayCell } from "./DayCell";
import { useAppSelector } from "@/store/hooks";
import { toKey, todayKey, fromKey, isFuture, cx } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar({ onSelect }: { onSelect: (dateKey: string) => void }) {
  const [cursor, setCursor] = useState(() => new Date());
  const deliveries = useAppSelector((s) => s.deliveries.items);
  const startDate = useAppSelector((s) => s.subscription.data?.startDate);

  const countByDate = useMemo(() => {
    const map = new Map<string, 0 | 1 | 2>();
    for (const d of deliveries) map.set(d.date, d.count as 0 | 1 | 2);
    return map;
  }, [deliveries]);

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  const today = todayKey();
  const planStart = startDate ? fromKey(startDate) : null;

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">
          {format(cursor, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor((c) => subMonths(c, 1))}
            aria-label="Previous month"
            className="rounded-lg p-2 text-muted transition hover:bg-paper hover:text-ink"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCursor(new Date())}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-paper hover:text-ink"
          >
            Today
          </button>
          <button
            onClick={() => setCursor((c) => addMonths(c, 1))}
            aria-label="Next month"
            className="rounded-lg p-2 text-muted transition hover:bg-paper hover:text-ink"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={cx(
              "pb-1 text-center text-xs font-medium",
              i === 0 || i === 6 ? "text-saffron-deep" : "text-muted"
            )}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const key = toKey(day);
          const beforeStart = planStart ? day < planStart : false;
          // Future days can't be logged — you can only record meals that have
          // actually happened (today and earlier).
          const future = isFuture(key);
          return (
            <DayCell
              key={key}
              dateKey={key}
              dayNumber={day.getDate()}
              count={countByDate.get(key)}
              inMonth={isSameMonth(day, cursor)}
              isToday={key === today}
              disabled={beforeStart || future}
              onSelect={onSelect}
            />
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-xs text-muted">
        <LegendDot className="bg-leaf-soft border-leaf/40" label="Once" />
        <LegendDot
          className="bg-saffron-soft border-saffron/50"
          label="Twice (×2)"
        />
        <LegendDot className="bg-clay-soft border-clay/40" label="Didn't come" />
        <LegendDot className="bg-paper border-line" label="Not logged" />
      </div>
    </section>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cx("h-3.5 w-3.5 rounded border", className)} />
      {label}
    </span>
  );
}
