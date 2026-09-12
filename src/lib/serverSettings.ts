import fs from "fs";
import path from "path";

const SETTINGS_FILE_PATH = path.join(process.cwd(), "src", "data", "settings-db.json");
const TMP_SETTINGS_FILE_PATH = path.join("/tmp", "settings-db.json");

import { 
  Car, carsData, 
  defaultCategories, 
  Testimonial, testimonialsData, 
  FAQItem, faqsData, 
  BlogPost, blogPostsData, 
  PricingSeason, defaultPricingSeasons 
} from "@/data/cars";

export interface DriverSetting {
  id: string;
  name: string;
  phone: string;
  simNumber: string;
  simType: "SIM A" | "SIM B1 Umum";
  simExpiry: string;
  status: "Standby" | "On Trip" | "Off";
  rating: number;
  totalTrips: number;
  avatarUrl: string;
  notes?: string;
}

export interface SiteSettings {
  brandName: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  bgImages: string[];
  whatsappNumber: string;
  contactPhone: string;
  contactEmail: string;
  showroomAddress: string;
  googleMapsLink: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  whatsappTemplate: string;
  rentalTerms: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  cars?: Car[];
  categories?: string[];
  testimonials?: Testimonial[];
  faqs?: FAQItem[];
  blogPosts?: BlogPost[];
  pricingSeasons?: PricingSeason[];
  drivers?: DriverSetting[];
  lastUpdated?: number;
}

export const defaultSiteSettings: SiteSettings = {
  brandName: "RENTAL MOBIL",
  logoUrl: "/images/logo.png",
  heroTitle: "Temukan Mobil Terbaik",
  heroSubtitle: "SEWA MOBIL HARIAN, MINGGUAN, BULANAN DENGAN UNIT PRIMA HARGA TERBAIK.",
  bgImages: [
    "/images/hero-banner.webp",
    "/images/cars/suv-banner.webp",
    "/images/cars/fleet-banner.webp"
  ],
  whatsappNumber: "6281234567890",
  contactPhone: "+62 21-8080-9999",
  contactEmail: "support@rentalmobil.id",
  showroomAddress: "Sudirman Central Business District (SCBD) Lot 12, Senayan, Jakarta Selatan 12190",
  googleMapsLink: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.273641324795!2d106.8124976!3d-6.2275815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1505c21fcfd%3A0x6bde3e78a6ff603a!2sSCBD!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
  instagramUrl: "https://instagram.com",
  tiktokUrl: "https://tiktok.com",
  facebookUrl: "https://facebook.com",
  whatsappTemplate: "Halo Rental Mobil, saya tertarik sewa mobil [Nama Mobil] untuk tanggal [Tanggal]...",
  rentalTerms: "- KTP asli & kartu identitas sejenis\n- Surat Izin Mengemudi (SIM A) aktif\n- Deposit jaminan kerusakan wajib\n- Pengembalian unit tepat waktu",
  seoTitle: "RENTAL MOBIL | Sewa Mobil Harian, Mingguan & Bulanan",
  seoDescription: "Penyedia layanan rental mobil prima lepas kunci dan dengan sopir profesional. Unit terawat, harga terbaik 24 jam.",
  seoKeywords: "rental mobil, sewa mobil murah, sewa mobil lepas kunci, rental innova, rental avanza",
  cars: carsData,
  categories: defaultCategories,
  testimonials: testimonialsData,
  faqs: faqsData,
  blogPosts: blogPostsData,
  pricingSeasons: defaultPricingSeasons,
  lastUpdated: 1700000000000,
  drivers: [
    {
      id: "DRV-001",
      name: "Bpk. Joko Santoso",
      phone: "081233445566",
      simNumber: "920488192001",
      simType: "SIM B1 Umum",
      simExpiry: "2028-05-14",
      status: "On Trip",
      rating: 4.95,
      totalTrips: 142,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      notes: "Pengemudi senior, hafal rute Jabodetabek & Jawa Barat, paham etika tamu VIP."
    },
    {
      id: "DRV-002",
      name: "Bpk. Bambang Pamungkas",
      phone: "081288990011",
      simNumber: "880192847162",
      simType: "SIM A",
      simExpiry: "2027-11-20",
      status: "Standby",
      rating: 4.90,
      totalTrips: 88,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      notes: "Pengemudi ramah, disiplin waktu, mahir mobil matic & manual."
    },
    {
      id: "DRV-003",
      name: "Bpk. Asep Hendra",
      phone: "085711223344",
      simNumber: "771029384756",
      simType: "SIM A",
      simExpiry: "2029-01-18",
      status: "Standby",
      rating: 4.88,
      totalTrips: 64,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      notes: "Sangat sabar dan telaten untuk perjalanan keluarga santai & wisata."
    }
  ]
};

let inMemorySettings: SiteSettings = defaultSiteSettings;

export function readServerSettings(): SiteSettings {
  try {
    // If on Vercel and /tmp has updated copy, prioritize /tmp
    if (process.env.VERCEL && fs.existsSync(TMP_SETTINGS_FILE_PATH)) {
      try {
        const tmpRaw = fs.readFileSync(TMP_SETTINGS_FILE_PATH, "utf-8");
        const parsedTmp = JSON.parse(tmpRaw);
        inMemorySettings = { ...defaultSiteSettings, ...parsedTmp };
        return inMemorySettings;
      } catch {}
    }

    if (!fs.existsSync(SETTINGS_FILE_PATH)) {
      writeServerSettings(defaultSiteSettings);
      return defaultSiteSettings;
    }
    const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    inMemorySettings = { ...defaultSiteSettings, ...parsed };
    return inMemorySettings;
  } catch (error) {
    console.error("Error reading settings-db.json:", error);
    return inMemorySettings || defaultSiteSettings;
  }
}

export function writeServerSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = inMemorySettings || readServerSettings();
  const updated: SiteSettings = { 
    ...current, 
    ...settings,
    lastUpdated: settings.lastUpdated || Date.now()
  };
  inMemorySettings = updated;
  const jsonStr = JSON.stringify(updated, null, 2);

  // 1. If on Vercel, write to /tmp
  if (process.env.VERCEL) {
    try {
      fs.writeFileSync(TMP_SETTINGS_FILE_PATH, jsonStr, "utf-8");
    } catch (tmpErr) {
      console.warn("Could not write settings to /tmp on Vercel:", tmpErr);
    }
  }

  // 2. Local filesystem write
  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, jsonStr, "utf-8");
  } catch (error) {
    // If read-only filesystem (like Vercel), write to /tmp as fallback
    try {
      fs.writeFileSync(TMP_SETTINGS_FILE_PATH, jsonStr, "utf-8");
    } catch {}
    console.warn("Notice: settings saved to memory & /tmp (read-only filesystem):", error);
  }
  return updated;
}
