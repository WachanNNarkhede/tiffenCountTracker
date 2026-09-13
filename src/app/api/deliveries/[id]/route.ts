import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DeliveryModel } from "@/models/Delivery";

export const dynamic = "force-dynamic";

// DELETE /api/deliveries/:id -> remove one logged day by its record id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const res = await DeliveryModel.deleteOne({ _id: params.id });
    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ deleted: true, id: params.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not delete the entry." },
      { status: 500 }
    );
  }
}
