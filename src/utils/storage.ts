/**
 * Storage Utility with Automatic Quota Management & Self-Healing
 * Prevents QuotaExceededError when storing bookings, images, and data in localStorage.
 */

export interface DocumentInfo {
  ktpNumber: string;
  simNumber: string;
  ktpUrl: string;
  simUrl: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  socialMedia: string;
  verified: boolean;
}

export interface BookingRecordLike {
  id: string;
  client?: string;
  phone?: string;
  email?: string;
  car?: string;
  carPlate?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  totalPrice?: number;
  depositAmount?: number;
  paymentStatus?: string;
  rentalType?: string;
  driverName?: string;
  status?: string;
  date?: string;
  pickupLocation?: string;
  documents?: {
    ktpNumber?: string;
    simNumber?: string;
    ktpUrl?: string;
    simUrl?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    emergencyRelation?: string;
    socialMedia?: string;
    verified?: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

const FALLBACK_KTP_URL = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600";
const FALLBACK_SIM_URL = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=600";

/**
 * Strips huge base64 strings from older bookings to keep storage footprint minimal
 */
function sanitizeBookingsForStorage<T extends BookingRecordLike>(bookings: T[], keepImageCount = 3): T[] {
  return bookings.map((item, index) => {
    // Keep base64 image only for the newest `keepImageCount` items
    if (index >= keepImageCount && item.documents) {
      const isKtpBase64 = item.documents.ktpUrl?.startsWith("data:");
      const isSimBase64 = item.documents.simUrl?.startsWith("data:");

      if (isKtpBase64 || isSimBase64) {
        return {
          ...item,
          documents: {
            ...item.documents,
            ktpUrl: isKtpBase64 ? FALLBACK_KTP_URL : item.documents.ktpUrl,
            simUrl: isSimBase64 ? FALLBACK_SIM_URL : item.documents.simUrl,
          }
        };
      }
    }
    return item;
  });
}

/**
 * Safely saves bookings to localStorage with progressive fallbacks on QuotaExceededError
 */
export function safeSaveBookings<T extends BookingRecordLike>(bookings: T[]): boolean {
  if (typeof window === "undefined") return false;

  const STORAGE_KEY = "royal_drive_bookings_v2";

  // Attempt 1: Standard save with sanity cap (keep base64 on latest 3 bookings)
  try {
    const sanitized = sanitizeBookingsForStorage(bookings, 3);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    return true;
  } catch (e: any) {
    console.warn("Storage quota warning on attempt 1, running quota recovery...", e?.name || e);
  }

  // Attempt 2: Clean up legacy keys and only keep base64 on the 1 latest booking
  try {
    // Purge obsolete storage keys
    localStorage.removeItem("royal_drive_bookings");
    localStorage.removeItem("royal_drive_bookings_v1");
    localStorage.removeItem("royal_drive_debug");

    const sanitized = sanitizeBookingsForStorage(bookings, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    return true;
  } catch (e: any) {
    console.warn("Storage quota warning on attempt 2, pruning older records...", e?.name || e);
  }

  // Attempt 3: Strip ALL base64 data URLs from all records and keep only the latest 25 bookings
  try {
    const strippedAllImages = bookings.map((item) => {
      if (!item.documents) return item;
      return {
        ...item,
        documents: {
          ...item.documents,
          ktpUrl: item.documents.ktpUrl?.startsWith("data:") ? FALLBACK_KTP_URL : item.documents.ktpUrl,
          simUrl: item.documents.simUrl?.startsWith("data:") ? FALLBACK_SIM_URL : item.documents.simUrl,
        }
      };
    }).slice(0, 25);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(strippedAllImages));
    return true;
  } catch (e: any) {
    console.warn("Storage quota warning on attempt 3, saving emergency minimal dataset...", e?.name || e);
  }

  // Attempt 4: Emergency minimal dataset (10 newest records)
  try {
    const minimal = bookings.slice(0, 10).map((b) => ({
      ...b,
      documents: b.documents ? {
        ...b.documents,
        ktpUrl: FALLBACK_KTP_URL,
        simUrl: FALLBACK_SIM_URL,
      } : undefined
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
    return true;
  } catch (finalError) {
    // Silently fail without throwing uncaught QuotaExceededError in dev overlay
    return false;
  }
}

/**
 * Proactively cleans up bloated localStorage items on page load
 */
export function purgeObsoleteStorageKeys(): void {
  if (typeof window === "undefined") return;

  try {
    // Remove obsolete v1 keys if present
    if (localStorage.getItem("royal_drive_bookings")) {
      localStorage.removeItem("royal_drive_bookings");
    }
    if (localStorage.getItem("royal_drive_bookings_v1")) {
      localStorage.removeItem("royal_drive_bookings_v1");
    }

    // Check if royal_drive_bookings_v2 exists and contains bloated base64 data
    const raw = localStorage.getItem("royal_drive_bookings_v2");
    if (raw && raw.length > 1024 * 1024) { // larger than 1MB
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        safeSaveBookings(parsed);
      }
    }
  } catch (err) {
    // Ignore cleanup errors
  }
}
