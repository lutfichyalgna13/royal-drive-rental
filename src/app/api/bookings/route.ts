import { NextResponse } from "next/server";
import { readServerBookings, writeServerBookings, addServerBooking } from "@/lib/serverBookings";
import { isAuthenticatedAdmin, sanitizeBooking } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bookings = readServerBookings();
    return NextResponse.json(
      { success: true, bookings },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal membaca database pesanan." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting: Max 6 booking submissions per 10 minutes per IP (Anti-Spam & DoS)
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`booking_create:${clientIp}`, 6, 10 * 60);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak permintaan pemesanan dari perangkat Anda. Silakan coba lagi dalam ${Math.ceil(rateCheck.resetSeconds / 60)} menit.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    if (!body || !body.id) {
      return NextResponse.json(
        { success: false, message: "Payload pemesanan tidak valid: ID pemesanan wajib disertakan." },
        { status: 400 }
      );
    }

    // 2. Strict Input Sanitization & Anti-XSS Cleaning
    const sanitized = sanitizeBooking(body);
    if (!sanitized || !sanitized.id || !sanitized.client || !sanitized.phone) {
      return NextResponse.json(
        { success: false, message: "Data pemesanan tidak lengkap atau format tidak valid." },
        { status: 400 }
      );
    }

    const updated = addServerBooking(sanitized);
    return NextResponse.json({ success: true, booking: sanitized, bookings: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal menyimpan pemesanan." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Admin Authentication Check for modifications
    if (!isAuthenticatedAdmin(request)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Operasi ini memerlukan autentikasi administrator." },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (body.bookings && Array.isArray(body.bookings)) {
      const sanitizedList = body.bookings.map((b: any) => sanitizeBooking(b)).filter(Boolean);
      writeServerBookings(sanitizedList);
      return NextResponse.json({ success: true, count: sanitizedList.length });
    } else if (body.id) {
      const sanitized = sanitizeBooking(body);
      const updated = addServerBooking(sanitized);
      return NextResponse.json({ success: true, booking: sanitized, bookings: updated });
    }

    return NextResponse.json(
      { success: false, message: "Payload tidak valid untuk PUT /api/bookings" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memperbarui pesanan." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Admin Authentication Check for wiping/deleting all bookings
    if (!isAuthenticatedAdmin(request)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Hanya administrator resmi yang dapat mengosongkan data pesanan." },
        { status: 401 }
      );
    }

    writeServerBookings([]);
    return NextResponse.json({ success: true, message: "Semua data pesanan berhasil dikosongkan.", count: 0 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal mengosongkan pesanan." },
      { status: 500 }
    );
  }
}
