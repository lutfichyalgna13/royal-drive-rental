import { NextResponse } from "next/server";
import { isAuthenticatedAdmin, verifyAdminSessionToken } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const isAuth = isAuthenticatedAdmin(request);

  if (!isAuth) {
    return NextResponse.json(
      { authenticated: false, message: "Sesi administrator tidak ditemukan atau telah kedaluwarsa." },
      { status: 401 }
    );
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );
  const token = cookies["royal_drive_admin_session"];
  const verified = verifyAdminSessionToken(token);

  return NextResponse.json({
    authenticated: true,
    email: verified.email || "admin@royaldrive.com",
    role: "admin",
  });
}
