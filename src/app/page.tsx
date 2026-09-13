"use client";

import { useEffect } from "react";
import { UtensilsCrossed } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscription } from "@/store/subscriptionSlice";
import { fetchDeliveries } from "@/store/deliverySlice";
import { Dashboard } from "@/components/Dashboard";
import { SubscriptionSetup } from "@/components/SubscriptionSetup";

export default function Home() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.subscription.status);
  const subscription = useAppSelector((s) => s.subscription.data);
  const error = useAppSelector((s) => s.subscription.error);

  useEffect(() => {
    dispatch(fetchSubscription());
  }, [dispatch]);

  // Once we know the plan, load its deliveries.
  useEffect(() => {
    if (subscription?._id) dispatch(fetchDeliveries(subscription._id));
  }, [subscription?._id, dispatch]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="flex flex-col items-center gap-3 text-muted">
          <span className="grid h-12 w-12 animate-pop place-items-center rounded-2xl bg-saffron-soft text-saffron-deep">
            <UtensilsCrossed size={22} />
          </span>
          <p className="text-sm">Warming up your tiffin…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="max-w-sm rounded-3xl border border-line bg-surface p-6 text-center shadow-card">
          <p className="font-display text-lg font-semibold text-ink">
            Couldn&apos;t reach the database
          </p>
          <p className="mt-2 text-sm text-muted">
            {error ?? "Check that MongoDB is running and MONGODB_URI is set."}
          </p>
          <button
            onClick={() => dispatch(fetchSubscription())}
            className="mt-4 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="grid min-h-screen place-items-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <SubscriptionSetup />
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
