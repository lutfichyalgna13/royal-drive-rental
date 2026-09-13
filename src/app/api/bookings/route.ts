import { NextResponse } from "next/server";
import { readServerBookings, writeServerBookings, addServerBooking } from "@/lib/serverBookings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = readServerBookings();
    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.id) {
      return NextResponse.json(
        { success: false, message: "Invalid booking payload: id is required" },
        { status: 400 }
      );
    }
    const updated = addServerBooking(body);
    return NextResponse.json({ success: true, booking: body, bookings: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to save booking" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (body.bookings && Array.isArray(body.bookings)) {
      writeServerBookings(body.bookings);
      return NextResponse.json({ success: true, count: body.bookings.length });
    } else if (body.id) {
      const updated = addServerBooking(body);
      return NextResponse.json({ success: true, booking: body, bookings: updated });
    }
    return NextResponse.json(
      { success: false, message: "Invalid payload for PUT /api/bookings" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update bookings" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    writeServerBookings([]);
    return NextResponse.json({ success: true, message: "All bookings cleared successfully", count: 0 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to clear bookings" },
      { status: 500 }
    );
  }
}
