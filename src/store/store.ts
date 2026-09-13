import { configureStore } from "@reduxjs/toolkit";
import subscriptionReducer from "./subscriptionSlice";
import deliveryReducer from "./deliverySlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      subscription: subscriptionReducer,
      deliveries: deliveryReducer,
    },
  });

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
