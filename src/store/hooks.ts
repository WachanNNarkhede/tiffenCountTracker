import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

// ---- Derived selectors ----

/** Total meals received = sum of every logged day's count (twice = 2). */
export const selectReceived = (state: RootState) =>
  state.deliveries.items.reduce((sum, d) => sum + d.count, 0);

/** Meals still left in the plan. Never negative. */
export const selectRemaining = (state: RootState) => {
  const total = state.subscription.data?.totalMeals ?? 0;
  const received = selectReceived(state);
  return Math.max(total - received, 0);
};

/** How many calendar days you've actually received tiffin (not meal count). */
export const selectDeliveredDays = (state: RootState) =>
  state.deliveries.items.filter((d) => d.count > 0).length;

/** Days where you got a double. */
export const selectDoubleDays = (state: RootState) =>
  state.deliveries.items.filter((d) => d.count === 2).length;
