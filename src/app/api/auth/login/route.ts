import { NextResponse } from "next/server";
import { hashPassword, secureCompare, createAdminSessionToken } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { readServerSettings } from "@/lib/serverSettings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. Rate Limiting: Max 5 failed attempts per 15 minutes per IP
    const rateLimitKey = `auth_login:${clientIp}`;
    const rateCheck = checkRateLimit(rateLimitKey, 6, 15 * 60);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan login gagal. Demi keamanan, silakan coba lagi dalam ${Math.ceil(rateCheck.resetSeconds / 60)} menit.`,
          lockout: true,
          retryAfterSeconds: rateCheck.resetSeconds,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPass = password.trim();

    // 2. Validate Credentials
    // Default system credentials or customized settings
    const settings = readServerSettings();
    const targetEmail = (settings?.adminEmail || "admin@royaldrive.com").toLowerCase().trim();

    let isPasswordValid = false;
    if (settings?.adminPasswordHash) {
      const inputHash = hashPassword(trimmedPass);
      isPasswordValid = secureCompare(inputHash, settings.adminPasswordHash);
    } else {
      // Default initial password: admin or RoyalAdmin#2026 (strong default to avoid Chrome breached password warning)
      isPasswordValid = secureCompare(trimmedPass, "admin") || secureCompare(trimmedPass, "RoyalAdmin#2026");
    }

    const isEmailValid = secureCompare(trimmedEmail, targetEmail);

    if (!isEmailValid || !isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Email atau kata sandi administrator salah. Silakan periksa kembali.",
          remainingAttempts: rateCheck.remaining,
        },
        { status: 401 }
      );
    }

    // 3. Generate Cryptographically Signed Session Token
    const sessionToken = createAdminSessionToken(trimmedEmail);

    const response = NextResponse.json({
      success: true,
      message: "Autentikasi administrator berhasil diverifikasi.",
      admin: {
        email: trimmedEmail,
        role: "admin",
      },
    });

    // 4. Issue HttpOnly, Secure, SameSite=Strict Cookie
    response.cookies.set("royal_drive_admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Terjadi kesalahan internal pada server autentikasi." },
      { status: 500 }
    );
  }
}
