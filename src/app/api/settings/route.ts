import { NextResponse } from "next/server";
import { readServerSettings, writeServerSettings } from "@/lib/serverSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = readServerSettings();
    return NextResponse.json(
      { success: true, settings },
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
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid payload for PUT /api/settings" },
        { status: 400 }
      );
    }
    const updated = writeServerSettings(body);
    return NextResponse.json(
      { success: true, settings: updated },
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
