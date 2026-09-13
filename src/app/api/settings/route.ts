import { NextResponse } from "next/server";
import { readServerSettings, writeServerSettings } from "@/lib/serverSettings";
import { isAuthenticatedAdmin } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawSettings = readServerSettings() || {};
    // Omit sensitive authentication hashes from public response
    const { adminPasswordHash, adminPassword, ...safeSettings } = rawSettings as any;

    return NextResponse.json(
      { success: true, settings: safeSettings },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to read settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // 1. Rate limiting: Max 30 updates per minute per IP
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`settings_update:${clientIp}`, 30, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak permintaan perubahan pengaturan. Silakan tunggu sebentar." },
        { status: 429 }
      );
    }

    // 2. Strict Authentication: Verify Admin Session
    if (!isAuthenticatedAdmin(request)) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak: Operasi ini memerlukan hak akses administrator resmi.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Payload tidak valid untuk pembaruan pengaturan." },
        { status: 400 }
      );
    }

    const updated = writeServerSettings(body);
    const { adminPasswordHash, adminPassword, ...safeUpdated } = updated as any;

    return NextResponse.json(
      { success: true, settings: safeUpdated },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
