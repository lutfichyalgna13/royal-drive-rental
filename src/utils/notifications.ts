// Real-time Notification Utilities for Royal Drive
import { formatRupiah } from "../data/cars";

/**
 * Plays a pleasant luxury dual-tone notification chime using the Web Audio API.
 * Does not require external audio files, works offline, and has zero latency.
 */
export function playNotificationChime() {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Tone 2: A5 (880.00 Hz) - higher pleasant resolution
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.35, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.85);

    // Tone 3: D6 (1174.66 Hz) - crystalline harmonic tail
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(1174.66, now + 0.22);
    gain3.gain.setValueAtTime(0.2, now + 0.22);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.22);
    osc3.stop(now + 1.1);
  } catch (err) {
    console.warn("Unable to play notification chime:", err);
  }
}

/**
 * Requests desktop browser push notification permission from the user.
 */
export async function requestDesktopNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return "denied";
  }
}

/**
 * Dispatches an OS-level desktop notification via HTML5 Notification API.
 */
export function sendDesktopNotification(
  title: string,
  body: string,
  onClick?: () => void
) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    try {
      const notif = new Notification(title, {
        body,
        icon: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=128",
        tag: "royal_drive_booking",
      });

      if (onClick) {
        notif.onclick = () => {
          window.focus();
          onClick();
          notif.close();
        };
      }
    } catch (err) {
      console.warn("Desktop notification dispatch error:", err);
    }
  }
}

/**
 * Formats a WhatsApp alert message for Showroom Owner / Dispatcher
 */
export function generateAdminWhatsAppAlertUrl(
  adminPhone: string,
  booking: {
    id: string;
    client: string;
    phone: string;
    car: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    rentalType: string;
    totalPrice: number;
    depositAmount: number;
    pickupLocation?: string;
  },
  brandName = "ROYAL DRIVE"
): string {
  const cleanPhone = adminPhone.replace(/\D/g, "");
  const formattedPrice = formatRupiah(booking.totalPrice);
  const formattedDP = formatRupiah(booking.depositAmount);

  const text = 
    `*🚨 PESANAN SEWA BARU MASUK (${brandName})*\n\n` +
    `• *No. Booking:* ${booking.id}\n` +
    `• *Penyewa:* ${booking.client} (${booking.phone})\n` +
    `• *Armada:* ${booking.car}\n` +
    `• *Durasi:* ${booking.durationDays} Hari (${booking.startDate} s/d ${booking.endDate})\n` +
    `• *Layanan:* ${booking.rentalType}\n` +
    `• *Total Sewa:* ${formattedPrice}\n` +
    `• *DP / Deposit:* ${formattedDP}\n` +
    `• *Lokasi Jemput:* ${booking.pickupLocation || "Showroom"}\n\n` +
    `_Penyewa baru saja menyelesaikan verifikasi di website. Segera periksa dokumen dan konfirmasi jadwal armada._`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
