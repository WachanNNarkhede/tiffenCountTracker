import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { NewSubscriptionInput, Subscription } from "@/types";
import { dataClient } from "@/lib/dataClient";

interface SubscriptionState {
  data: Subscription | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
}

const initialState: SubscriptionState = {
  data: null,
  status: "idle",
  error: null,
};

export const fetchSubscription = createAsyncThunk(
  "subscription/fetch",
  async () => {
    return dataClient.getSubscription();
  }
);

export const createSubscription = createAsyncThunk(
  "subscription/create",
  async (input: NewSubscriptionInput) => {
    return dataClient.createSubscription(input);
  }
);

export const updateSubscription = createAsyncThunk(
  "subscription/update",
  async (input: Partial<NewSubscriptionInput>) => {
    return dataClient.updateSubscription(input);
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.status = "ready";
        state.data = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Something went wrong.";
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = "ready";
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.data = action.payload;
      });
  },
});

export default subscriptionSlice.reducer;
