import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { SubscriptionModel } from "@/models/Subscription";

export const dynamic = "force-dynamic";

function serialize(doc: any) {
  if (!doc) return null;
  return {
    _id: String(doc._id),
    name: doc.name,
    totalMeals: doc.totalMeals,
    startDate: doc.startDate,
    active: doc.active,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
  };
}

// GET /api/subscription -> the currently active subscription (or null)
export async function GET() {
  try {
    await connectToDatabase();
    const sub = await SubscriptionModel.findOne({ active: true })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ subscription: serialize(sub) });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load your subscription." },
      { status: 500 }
    );
  }
}

// POST /api/subscription -> start a new plan (deactivates any previous one)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "My tiffin plan").trim();
    const totalMeals = Number(body.totalMeals);
    const startDate = String(body.startDate || "").slice(0, 10);

    if (!Number.isFinite(totalMeals) || totalMeals < 1) {
      return NextResponse.json(
        { error: "Enter a meal count of at least 1." },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return NextResponse.json(
        { error: "Pick a valid start date." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await SubscriptionModel.updateMany({ active: true }, { active: false });
    const created = await SubscriptionModel.create({
      name,
      totalMeals,
      startDate,
      active: true,
    });

    return NextResponse.json(
      { subscription: serialize(created.toObject()) },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not start the plan. Try again." },
      { status: 500 }
    );
  }
}

// PATCH /api/subscription -> edit the active plan's name / total / start date
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    const update: Record<string, unknown> = {};
    if (typeof body.name === "string") update.name = body.name.trim();
    if (body.totalMeals != null) {
      const n = Number(body.totalMeals);
      if (!Number.isFinite(n) || n < 1) {
        return NextResponse.json(
          { error: "Enter a meal count of at least 1." },
          { status: 400 }
        );
      }
      update.totalMeals = n;
    }
    if (typeof body.startDate === "string") {
      const d = body.startDate.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        return NextResponse.json(
          { error: "Pick a valid start date." },
          { status: 400 }
        );
      }
      update.startDate = d;
    }

    const sub = await SubscriptionModel.findOneAndUpdate(
      { active: true },
      update,
      { new: true }
    ).lean();

    if (!sub) {
      return NextResponse.json(
        { error: "No active plan to update." },
        { status: 404 }
      );
    }
    return NextResponse.json({ subscription: serialize(sub) });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not save changes." },
      { status: 500 }
    );
  }
}
