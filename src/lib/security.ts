import crypto from "crypto";

const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || "royal_drive_security_hmac_secret_key_2026_salt";

/**
 * Hash password with SHA-256 and constant secret
 */
export function hashPassword(password: string): string {
  return crypto
    .createHmac("sha256", SECRET_KEY)
    .update(password.trim())
    .digest("hex");
}

/**
 * Secure constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Generates an HMAC signed session token for admin
 */
export function createAdminSessionToken(email: string): string {
  const payload = JSON.stringify({
    email: email.toLowerCase().trim(),
    role: "admin",
    issuedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

/**
 * Validates HMAC signed session token
 */
export function verifyAdminSessionToken(token: string | null | undefined): { valid: boolean; email?: string } {
  if (!token || typeof token !== "string") return { valid: false };
  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false };

  const [encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(encodedPayload)
    .digest("base64url");

  if (!secureCompare(signature, expectedSignature)) {
    return { valid: false };
  }

  try {
    const payloadStr = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload = JSON.parse(payloadStr);

    if (!payload.expiresAt || Date.now() > payload.expiresAt) {
      return { valid: false };
    }

    if (payload.role !== "admin") {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

/**
 * Checks admin authentication from request cookies or Authorization header
 */
export function isAuthenticatedAdmin(request: Request): boolean {
  // 1. Check Cookie: royal_drive_admin_session
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );

  const sessionToken = cookies["royal_drive_admin_session"];
  if (sessionToken && verifyAdminSessionToken(sessionToken).valid) {
    return true;
  }

  // 2. Check Authorization Bearer header fallback
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    if (verifyAdminSessionToken(bearerToken).valid) {
      return true;
    }
  }

  return false;
}

/**
 * Sanitizes input string to prevent XSS (Cross-Site Scripting) and code injection
 */
export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .replace(/javascript:/gi, "") // Strip javascript: protocol
    .replace(/data:/gi, (match, offset) => (offset === 0 ? "" : match)) // Disallow leading data: url
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes phone number to digits, plus, and dashes
 */
export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== "string") return "";
  return phone.replace(/[^0-9+\-\s()]/g, "").trim().slice(0, 25);
}

/**
 * Validates email address format
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Sanitizes image URL or data URI safely, protecting against script injection
 */
export function sanitizeImageUrl(input: unknown, maxLength = 2_000_000): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  // Safe base64 image data URIs
  if (trimmed.startsWith("data:image/") && trimmed.includes(";base64,")) {
    const parts = trimmed.split(";base64,");
    if (parts.length === 2 && /^[A-Za-z0-9+/=]+$/.test(parts[1])) {
      return trimmed.slice(0, maxLength);
    }
  }
  // Safe HTTP/HTTPS image URLs
  if (/^https?:\/\/[^\s<>"']+$/i.test(trimmed)) {
    return trimmed.slice(0, 2048);
  }
  // Safe relative paths
  if (/^\/[A-Za-z0-9_.\-\/%]+$/i.test(trimmed)) {
    return trimmed.slice(0, 2048);
  }
  return "";
}

/**
 * Deep sanitizes booking payload to prevent any malicious payload injection
 */
export function sanitizeBooking(body: any): any {
  if (!body || typeof body !== "object") return null;

  return {
    ...body,
    id: sanitizeString(body.id, 30),
    client: sanitizeString(body.client, 100),
    phone: sanitizePhone(body.phone),
    email: sanitizeString(body.email, 100),
    car: sanitizeString(body.car, 100),
    carPlate: sanitizeString(body.carPlate, 20),
    startDate: sanitizeString(body.startDate, 20),
    endDate: sanitizeString(body.endDate, 20),
    durationDays: Math.max(1, Math.min(365, Number(body.durationDays) || 1)),
    totalPrice: Math.max(0, Number(body.totalPrice) || 0),
    depositAmount: Math.max(0, Number(body.depositAmount) || 0),
    paymentStatus: ["DP Lunas", "Lunas", "Belum Bayar", "Refund"].includes(body.paymentStatus) ? body.paymentStatus : "Belum Bayar",
    rentalType: ["Lepas Kunci", "Dengan Sopir"].includes(body.rentalType) ? body.rentalType : "Lepas Kunci",
    status: ["Pending", "Active", "Completed", "Cancelled", "Dibatalkan"].includes(body.status) ? body.status : "Pending",
    pickupLocation: sanitizeString(body.pickupLocation, 200),
    paymentProofUrl: body.paymentProofUrl ? sanitizeImageUrl(body.paymentProofUrl) : undefined,
    paymentProofTime: body.paymentProofTime ? sanitizeString(body.paymentProofTime, 100) : undefined,
    securityDepositStatus: body.securityDepositStatus ? sanitizeString(body.securityDepositStatus, 50) : undefined,
    driverName: body.driverName ? sanitizeString(body.driverName, 100) : undefined,
    documents: body.documents && typeof body.documents === "object" ? {
      ktpNumber: sanitizeString(body.documents.ktpNumber, 30),
      simNumber: sanitizeString(body.documents.simNumber, 30),
      ktpUrl: sanitizeImageUrl(body.documents.ktpUrl),
      simUrl: sanitizeImageUrl(body.documents.simUrl),
      emergencyName: sanitizeString(body.documents.emergencyName, 100),
      emergencyPhone: sanitizePhone(body.documents.emergencyPhone),
      emergencyRelation: sanitizeString(body.documents.emergencyRelation, 50),
      socialMedia: sanitizeString(body.documents.socialMedia, 100),
      verified: Boolean(body.documents.verified),
    } : undefined,
  };
}
