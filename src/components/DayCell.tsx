"use client";

import { cx, isWeekend } from "@/lib/utils";
import type { DeliveryCount } from "@/types";

interface Props {
  dateKey: string;
  dayNumber: number;
  count: DeliveryCount | undefined; // undefined = not logged
  inMonth: boolean;
  isToday: boolean;
  disabled: boolean; // before plan start date
  onSelect: (dateKey: string) => void;
}

export function DayCell({
  dateKey,
  dayNumber,
  count,
  inMonth,
  isToday,
  disabled,
  onSelect,
}: Props) {
  const weekend = isWeekend(dateKey);

  const stateClasses =
    count === 1
      ? "bg-leaf-soft text-leaf border-leaf/40"
      : count === 2
      ? "bg-saffron-soft text-saffron-deep border-saffron/50"
      : count === 0
      ? "bg-clay-soft text-clay border-clay/40 line-through decoration-clay/50"
      : "bg-surface text-ink border-line hover:border-ink/25";

  return (
    <button
      onClick={() => onSelect(dateKey)}
      disabled={disabled}
      aria-label={`Day ${dayNumber}`}
      className={cx(
        "relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm transition",
        stateClasses,
        !inMonth && "opacity-35",
        disabled && "cursor-not-allowed opacity-30 hover:border-line",
        weekend && count === undefined && "bg-paper"
      )}
    >
      <span className={cx("font-medium", isToday && "font-semibold")}>
        {dayNumber}
      </span>

      {count === 2 && (
        <span className="mt-0.5 text-[10px] font-semibold leading-none">
          ×2
        </span>
      )}

      {isToday && (
        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-current" />
      )}
    </button>
  );
}
