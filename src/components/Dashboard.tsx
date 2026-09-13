"use client";

import { useState } from "react";
import { Plus, Settings } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { StatsCards } from "./StatsCards";
import { Calendar } from "./Calendar";
import { DeliveryList } from "./DeliveryList";
import { DayEditor } from "./DayEditor";
import { Modal } from "./Modal";
import { SubscriptionSetup } from "./SubscriptionSetup";
import { todayKey } from "@/lib/utils";

export function Dashboard() {
  const subscription = useAppSelector((s) => s.subscription.data);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  if (!subscription) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-saffron-deep">ProtinPro</p>
          <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {subscription.name}
          </h1>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Plan settings"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-muted shadow-card transition hover:text-ink"
        >
          <Settings size={18} />
        </button>
      </header>

      <div className="space-y-6">
        <StatsCards />

        <button
          onClick={() => setEditingDate(todayKey())}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-saffron py-3.5 font-medium text-ink shadow-card transition hover:bg-saffron-deep hover:text-paper"
        >
          <Plus size={18} />
          Log today&apos;s tiffin
        </button>

        <Calendar onSelect={setEditingDate} />
        <DeliveryList onSelect={setEditingDate} />
      </div>

      <footer className="mt-10 text-center text-xs text-muted">
        Started {subscription.startDate} · {subscription.totalMeals} meals
      </footer>

      {editingDate && (
        <DayEditor
          dateKey={editingDate}
          onClose={() => setEditingDate(null)}
        />
      )}

      {showSettings && (
        <Modal title="Plan settings" onClose={() => setShowSettings(false)}>
          <SubscriptionSetup
            existing={subscription}
            onDone={() => setShowSettings(false)}
          />
        </Modal>
      )}
    </div>
  );
}
