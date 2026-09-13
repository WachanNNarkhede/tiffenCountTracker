import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Delivery, DeliveryInput } from "@/types";
import { dataClient } from "@/lib/dataClient";

interface DeliveryState {
  items: Delivery[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  saving: string | null; // date currently being saved
}

const initialState: DeliveryState = {
  items: [],
  status: "idle",
  error: null,
  saving: null,
};

export const fetchDeliveries = createAsyncThunk(
  "deliveries/fetch",
  async (subscriptionId: string) => {
    return dataClient.getDeliveries(subscriptionId);
  }
);

// Upsert a single day. count === 0 ("Didn't come") is kept as a real record.
export const setDelivery = createAsyncThunk(
  "deliveries/set",
  async (input: DeliveryInput) => {
    const json = await dataClient.setDelivery(input);
    return { input, json };
  }
);

// Remove a logged day entirely (back to "not logged").
export const removeDelivery = createAsyncThunk(
  "deliveries/remove",
  async (delivery: Delivery) => {
    await dataClient.removeDelivery(delivery);
    return delivery._id;
  }
);

const deliverySlice = createSlice({
  name: "deliveries",
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveries.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchDeliveries.fulfilled,
        (state, action: PayloadAction<Delivery[]>) => {
          state.status = "ready";
          state.items = action.payload;
        }
      )
      .addCase(fetchDeliveries.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message ?? "Could not load deliveries.";
      })
      .addCase(setDelivery.pending, (state, action) => {
        state.saving = action.meta.arg.date;
      })
      .addCase(setDelivery.fulfilled, (state, action) => {
        state.saving = null;
        const { input, json } = action.payload;
        const delivery = json.delivery as Delivery | undefined;
        if (!delivery) return;
        const idx = state.items.findIndex((d) => d.date === input.date);
        if (idx >= 0) state.items[idx] = delivery;
        else state.items.push(delivery);
        state.items.sort((a, b) => a.date.localeCompare(b.date));
      })
      .addCase(setDelivery.rejected, (state, action) => {
        state.saving = null;
        state.error = action.error.message ?? "Could not save the delivery.";
      })
      .addCase(removeDelivery.fulfilled, (state, action) => {
        const id = action.payload;
        const idx = state.items.findIndex((d) => d._id === id);
        if (idx >= 0) state.items.splice(idx, 1);
      })
      .addCase(removeDelivery.rejected, (state, action) => {
        state.error = action.error.message ?? "Could not remove the entry.";
      });
  },
});

export const { reset: resetDeliveries } = deliverySlice.actions;
export default deliverySlice.reducer;
