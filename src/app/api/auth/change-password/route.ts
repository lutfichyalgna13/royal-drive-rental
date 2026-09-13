import { NextResponse } from "next/server";
import { hashPassword, secureCompare, isAuthenticatedAdmin } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { readServerSettings, writeServerSettings } from "@/lib/serverSettings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. Rate Limiting: Max 5 password change attempts per 15 min
    const rateCheck = checkRateLimit(`auth_change_pw:${clientIp}`, 5, 15 * 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak permintaan penggantian password. Silakan coba lagi dalam ${Math.ceil(rateCheck.resetSeconds / 60)} menit.`,
        },
        { status: 429 }
      );
    }

    // 2. Authenticate Admin Session
    if (!isAuthenticatedAdmin(request)) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak: Operasi ini memerlukan login administrator aktif.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, email } = body || {};

    if (!currentPassword || !newPassword || typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json(
        { success: false, message: "Password saat ini dan password baru wajib diisi." },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 6) {
      return NextResponse.json(
        { success: false, message: "Password baru minimal harus 6 karakter." },
        { status: 400 }
      );
    }

    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();

    // 3. Verify Current Password
    const settings = readServerSettings();
    let isCurrentValid = false;

    if (settings?.adminPasswordHash) {
      const currentHash = hashPassword(trimmedCurrent);
      isCurrentValid = secureCompare(currentHash, settings.adminPasswordHash);
    } else {
      isCurrentValid =
        secureCompare(trimmedCurrent, "admin") ||
        secureCompare(trimmedCurrent, "RoyalAdmin#2026");
    }

    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, message: "Password saat ini yang Anda masukkan salah." },
        { status: 400 }
      );
    }

    // 4. Hash and Persist New Password Hash on Server
    const newHash = hashPassword(trimmedNew);
    const updatedFields: Record<string, any> = {
      adminPasswordHash: newHash,
      lastUpdated: Date.now(),
    };

    if (email && typeof email === "string" && email.includes("@")) {
      updatedFields.adminEmail = email.trim().toLowerCase();
    }

    writeServerSettings(updatedFields);

    return NextResponse.json({
      success: true,
      message: "Kata sandi administrator berhasil diperbarui dan disimpan secara aman di server.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Gagal memperbarui kata sandi." },
      { status: 500 }
    );
  }
}
