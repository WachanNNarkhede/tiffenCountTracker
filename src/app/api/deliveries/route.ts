import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DeliveryModel } from "@/models/Delivery";

export const dynamic = "force-dynamic";

function serialize(doc: any) {
  return {
    _id: String(doc._id),
    subscriptionId: String(doc.subscriptionId),
    date: doc.date,
    count: doc.count,
    note: doc.note || "",
  };
}

// GET /api/deliveries?subscriptionId=... -> all logged deliveries for a plan
export async function GET(req: NextRequest) {
  try {
    const subscriptionId = req.nextUrl.searchParams.get("subscriptionId");
    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId is required." },
        { status: 400 }
      );
    }
    await connectToDatabase();
    const docs = await DeliveryModel.find({ subscriptionId })
      .sort({ date: 1 })
      .lean();
    return NextResponse.json({ deliveries: docs.map(serialize) });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not load deliveries." },
      { status: 500 }
    );
  }
}

// POST /api/deliveries -> upsert a day. count 0 removes the record entirely.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const subscriptionId = String(body.subscriptionId || "");
    const date = String(body.date || "").slice(0, 10);
    const count = Number(body.count);
    const note = typeof body.note === "string" ? body.note.trim() : "";

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId is required." },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }
    if (![0, 1, 2].includes(count)) {
      return NextResponse.json(
        { error: "Count must be 0, 1, or 2." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // count 0 = "Didn't come" — persisted like any other day. Removing a day
    // entirely is done via DELETE /api/deliveries/:id.
    const doc = await DeliveryModel.findOneAndUpdate(
      { subscriptionId, date },
      { $set: { count, note } },
      { new: true, upsert: true }
    ).lean();

    return NextResponse.json({ delivery: serialize(doc) });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not save the delivery." },
      { status: 500 }
    );
  }
}
