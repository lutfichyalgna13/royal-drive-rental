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
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
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
    // 1. Rate Limiting: Max 60 submissions per 10 minutes per IP (generous for testing & NAT environments)
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`booking_create:${clientIp}`, 60, 10 * 60);

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
    if (!sanitized || !sanitized.id || !sanitized.client) {
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
    const body = await request.json();

    // 1. Single Booking Update (e.g. customer uploading payment proof)
    if (body.id && !body.bookings) {
      const sanitized = sanitizeBooking(body);
      if (!sanitized) {
        return NextResponse.json(
          { success: false, message: "Format pemesanan tidak valid." },
          { status: 400 }
        );
      }
      const updated = addServerBooking(sanitized);
      return NextResponse.json({ success: true, booking: sanitized, bookings: updated });
    }

    // 2. Bulk Fleet Bookings Replacement requires Admin Authentication
    if (!isAuthenticatedAdmin(request)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Operasi pembaruan massal memerlukan autentikasi administrator." },
        { status: 401 }
      );
    }

    if (body.bookings && Array.isArray(body.bookings)) {
      const sanitizedList = body.bookings.map((b: any) => sanitizeBooking(b)).filter(Boolean);
      writeServerBookings(sanitizedList);
      return NextResponse.json({ success: true, count: sanitizedList.length });
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
