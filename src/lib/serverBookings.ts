import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "src", "data", "bookings-db.json");
const TMP_DB_FILE = path.join("/tmp", "bookings-db.json");

// In-memory fallback if filesystem writes are restricted
let inMemoryBookings: any[] = [];

export function readServerBookings(): any[] {
  try {
    // If on Vercel and /tmp has updated copy, prioritize /tmp
    if (process.env.VERCEL && fs.existsSync(TMP_DB_FILE)) {
      try {
        const tmpData = fs.readFileSync(TMP_DB_FILE, "utf8");
        const parsedTmp = JSON.parse(tmpData);
        if (Array.isArray(parsedTmp)) {
          inMemoryBookings = parsedTmp;
          return parsedTmp;
        }
      } catch {}
    }

    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        inMemoryBookings = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading bookings-db.json:", err);
  }
  return inMemoryBookings;
}

export function writeServerBookings(bookings: any[]): boolean {
  inMemoryBookings = bookings;
  const jsonStr = JSON.stringify(bookings, null, 2);

  // 1. If on Vercel or read-only environment, write to /tmp
  if (process.env.VERCEL) {
    try {
      fs.writeFileSync(TMP_DB_FILE, jsonStr, "utf8");
      return true;
    } catch (tmpErr) {
      console.warn("Could not write to /tmp on Vercel:", tmpErr);
    }
  }

  // 2. Primary local write
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, jsonStr, "utf8");
    return true;
  } catch (err) {
    // Fallback write to /tmp if primary path is read-only
    try {
      fs.writeFileSync(TMP_DB_FILE, jsonStr, "utf8");
      return true;
    } catch {}
    console.error("Error writing bookings-db.json:", err);
    return false;
  }
}

export function addServerBooking(newBooking: any): any[] {
  const current = readServerBookings();
  // Check if booking ID already exists
  const existingIndex = current.findIndex((b: any) => b.id === newBooking.id);
  let updated: any[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = newBooking;
  } else {
    updated = [newBooking, ...current];
  }
  writeServerBookings(updated);
  return updated;
}
