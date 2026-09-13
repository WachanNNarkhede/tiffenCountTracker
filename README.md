# Dabba — Tiffin Tracker

A small web app to track your evening tiffin subscription: mark each day as
**came once**, **came twice**, or **didn't come**, and see at a glance how many
meals you've received and how many are left in your plan.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Redux Toolkit**, and
**MongoDB (Mongoose)**.

---

## How the counting works

- A plan has a total number of **meals** (default **30**).
- Each calendar day can be logged as:
  - **Once** → counts as **1 meal** (the usual)
  - **Twice** → counts as **2 meals**
  - **Didn't come** → counts as **0** (removes the day)
- **Meals received** = the sum of every logged day's count.
- **Meals left** = `totalMeals − received`.

So a single "twice" day eats 2 of your 30 meals — exactly the `30 − 2` case you
wanted. Weekends are highlighted (since you usually don't get delivery then), but
you can still log them normally.

---

## Getting started

### 1. Prerequisites
- **Node.js 18.17+**
- A **MongoDB** database — either:
  - Local MongoDB running at `mongodb://127.0.0.1:27017`, or
  - A free **MongoDB Atlas** cluster (get a connection string from the Atlas UI).

### 2. Install dependencies
```bash
npm install
```

### 3. Configure the database
Copy the example env file and set your connection string:
```bash
cp .env.local.example .env.local
```
Then edit `.env.local`:
```
MONGODB_URI="mongodb://127.0.0.1:27017/tiffin-tracker"
```
For Atlas it looks like:
```
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/tiffin-tracker?retryWrites=true&w=majority"
```

### 4. Run it
```bash
npm run dev
```
Open http://localhost:3000. On first load you'll set up your plan (name, meal
count, start date). After that you land on the dashboard.

### 5. Production build
```bash
npm run build
npm start
```

---

## Using the app
- **Log today's tiffin** — the big saffron button jumps straight to today.
- **Any day** — tap a date on the calendar to mark it. Tap again to change it.
- **Meal ledger** — the row of pips up top fills as you receive meals, so you can
  see the whole plan at once.
- **Delivery log** — a running list of everything you've marked; tap a row to
  edit or use the trash icon to clear a day.
- **Plan settings** — the gear icon lets you rename the plan, change the meal
  count, or reset the start date. Starting a brand-new plan replaces the old one.

---

## Project structure
```
src/
  app/
    api/
      subscription/route.ts      GET active plan · POST new · PATCH edit
      deliveries/route.ts        GET list · POST upsert (count 0 = delete)
      deliveries/[id]/route.ts   DELETE one entry by id
    layout.tsx                   fonts + Redux provider
    page.tsx                     loads state, shows onboarding or dashboard
    globals.css
  components/                    Dashboard, Calendar, DayCell, DayEditor,
                                 StatsCards, DeliveryList, SubscriptionSetup, Modal
  store/                         Redux Toolkit store, slices, typed hooks + selectors
  models/                        Mongoose schemas (Subscription, Delivery)
  lib/                           mongodb connection, date/format utils
  types/                         shared TypeScript types
```

## Data model
- **Subscription**: `name`, `totalMeals`, `startDate (YYYY-MM-DD)`, `active`.
  Only one plan is active at a time.
- **Delivery**: `subscriptionId`, `date (YYYY-MM-DD)`, `count (1 | 2)`, `note`.
  A compound unique index on `(subscriptionId, date)` guarantees one entry per
  day. Marking a day "didn't come" deletes its record.

## Notes
- No authentication — this is a personal single-user tracker. If you deploy it
  publicly, put it behind auth (e.g. NextAuth) or keep it private.
- All meal math lives in typed Redux selectors (`src/store/hooks.ts`), so the UI
  stays a thin view over the store.
