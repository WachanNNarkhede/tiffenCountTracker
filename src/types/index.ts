// A delivery on a given date can be: 0 = not delivered, 1 = once (default), 2 = twice.
export type DeliveryCount = 0 | 1 | 2;

export interface Subscription {
  _id: string;
  name: string;
  /** Total meals in the plan, e.g. 30. Note: a "twice" day consumes 2 meals. */
  totalMeals: number;
  /** ISO date string (YYYY-MM-DD) the plan starts from. */
  startDate: string;
  active: boolean;
  createdAt: string;
}

export interface Delivery {
  _id: string;
  subscriptionId: string;
  /** YYYY-MM-DD — one entry per date per subscription. */
  date: string;
  count: DeliveryCount;
  note?: string;
}

/** Payload sent when the user taps a day to log delivery. */
export interface DeliveryInput {
  subscriptionId: string;
  date: string;
  count: DeliveryCount;
  note?: string;
}

export interface NewSubscriptionInput {
  name: string;
  totalMeals: number;
  startDate: string;
}
