export type CarCategory = 'MPV Keluarga' | 'City Car' | 'Minibus Wisata' | 'SUV Tangguh' | 'Sedan Mewah / VIP' | 'Mobil Listrik (EV)' | 'Wedding Car' | (string & {});

export const defaultCategories: string[] = [
  "MPV Keluarga",
  "City Car",
  "Minibus Wisata",
  "SUV Tangguh",
  "Sedan Mewah / VIP",
  "Mobil Listrik (EV)",
  "Wedding Car"
];

export interface Car {
  id: string;
  name: string;
  category: CarCategory;
  rating: number;
  reviewsCount: number;
  seats: number;
  transmission: 'Automatic' | 'Manual' | 'Dual-Clutch';
  fuelType: 'Pertalite' | 'Pertamax' | 'Pertamax Turbo' | 'Solar (Biosolar)' | 'Dexlite / Pertamina Dex' | 'Electric' | 'Hybrid';
  baggage: number; // number of large bags
  pricePerDay: number;
  driverPricePerDay: number;
  fuelPricePerDay: number;
  insurancePricePerDay: number;
  available: boolean;
  image: string; // Front 3/4 beauty shot
  gallery: string[]; // Interior and details
}

export function formatRupiah(val: number): string {
  if (!val && val !== 0) return "Rp 0";
  const numStr = Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${numStr}`;
}

export const carsData: Car[] = [
  {
    id: "toyota-calya",
    name: "Toyota Calya 1.2G",
    category: "MPV Keluarga",
    rating: 4.87,
    reviewsCount: 104,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Pertalite",
    baggage: 3,
    pricePerDay: 320000,
    driverPricePerDay: 200000,
    fuelPricePerDay: 130000,
    insurancePricePerDay: 45000,
    available: true,
    image: "/images/cars/calya.webp",
    gallery: ["/images/cars/calya.webp"]
  },
  {
    id: "daihatsu-sigra",
    name: "Daihatsu Sigra 1.2R Deluxe",
    category: "MPV Keluarga",
    rating: 4.84,
    reviewsCount: 89,
    seats: 7,
    transmission: "Manual",
    fuelType: "Pertalite",
    baggage: 3,
    pricePerDay: 300000,
    driverPricePerDay: 200000,
    fuelPricePerDay: 130000,
    insurancePricePerDay: 40000,
    available: true,
    image: "/images/cars/sigra.webp",
    gallery: ["/images/cars/sigra.webp"]
  },

  {
    id: "toyota-avanza",
    name: "Toyota Avanza 1.5G",
    category: "MPV Keluarga",
    rating: 4.88,
    reviewsCount: 124,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Pertamax",
    baggage: 3,
    pricePerDay: 400000,
    driverPricePerDay: 200000,
    fuelPricePerDay: 150000,
    insurancePricePerDay: 50000,
    available: true,
    image: "/images/cars/avanza.webp",
    gallery: ["/images/cars/avanza.webp"]
  },
  {
    id: "daihatsu-xenia",
    name: "Daihatsu Xenia 1.3R",
    category: "MPV Keluarga",
    rating: 4.85,
    reviewsCount: 92,
    seats: 7,
    transmission: "Manual",
    fuelType: "Pertalite",
    baggage: 3,
    pricePerDay: 350000,
    driverPricePerDay: 200000,
    fuelPricePerDay: 150000,
    insurancePricePerDay: 50000,
    available: true,
    image: "/images/cars/xenia.webp",
    gallery: ["/images/cars/xenia.webp"]
  },
  {
    id: "mitsubishi-xpander",
    name: "Mitsubishi Xpander Ultimate",
    category: "MPV Keluarga",
    rating: 4.93,
    reviewsCount: 148,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Pertamax",
    baggage: 3,
    pricePerDay: 500000,
    driverPricePerDay: 200000,
    fuelPricePerDay: 180000,
    insurancePricePerDay: 75000,
    available: true,
    image: "/images/cars/xpander.webp",
    gallery: ["/images/cars/xpander.webp"]
  },
  {
    id: "toyota-innova-reborn",
    name: "Toyota Kijang Innova Reborn 2.4G",
    category: "MPV Keluarga",
    rating: 4.95,
    reviewsCount: 210,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Solar (Biosolar)",
    baggage: 4,
    pricePerDay: 750000,
    driverPricePerDay: 250000,
    fuelPricePerDay: 250000,
    insurancePricePerDay: 100000,
    available: true,
    image: "/images/cars/innova-reborn.webp",
    gallery: ["/images/cars/innova-reborn.webp"]
  },
  {
    id: "toyota-innova-zenix",
    name: "Toyota Innova Zenix 2.0 Hybrid Q",
    category: "MPV Keluarga",
    rating: 4.97,
    reviewsCount: 184,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Hybrid",
    baggage: 4,
    pricePerDay: 900000,
    driverPricePerDay: 250000,
    fuelPricePerDay: 200000,
    insurancePricePerDay: 100000,
    available: true,
    image: "/images/cars/innova-zenix.webp",
    gallery: ["/images/cars/innova-zenix.webp"]
  },
  {
    id: "suzuki-ertiga",
    name: "Suzuki Ertiga Smart Hybrid",
    category: "MPV Keluarga",
    rating: 4.89,
    reviewsCount: 88,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Hybrid",
    baggage: 3,
    pricePerDay: 450000,
    driverPricePerDay: 200000,
    fuelPricePerDay: 140000,
    insurancePricePerDay: 60000,
    available: true,
    image: "/images/cars/ertiga.webp",
    gallery: ["/images/cars/ertiga.webp"]
  },
  {
    id: "honda-brio",
    name: "Honda Brio RS 1.2",
    category: "City Car",
    rating: 4.94,
    reviewsCount: 175,
    seats: 5,
    transmission: "Automatic",
    fuelType: "Pertamax",
    baggage: 2,
    pricePerDay: 350000,
    driverPricePerDay: 200000,
    fuelPricePerDay: 120000,
    insurancePricePerDay: 50000,
    available: true,
    image: "/images/cars/brio.webp",
    gallery: ["/images/cars/brio.webp"]
  },
  {
    id: "toyota-agya",
    name: "Toyota Agya GR Sport 1.2",
    category: "City Car",
    rating: 4.86,
    reviewsCount: 84,
    seats: 5,
    transmission: "Automatic",
    fuelType: "Pertamax",
    baggage: 2,
    pricePerDay: 320000,
    driverPricePerDay: 200000,
    fuelPricePerDay: 110000,
    insurancePricePerDay: 40000,
    available: true,
    image: "/images/cars/agya.webp",
    gallery: ["/images/cars/agya.webp"]
  },
  {
    id: "daihatsu-ayla",
    name: "Daihatsu Ayla 1.2R",
    category: "City Car",
    rating: 4.83,
    reviewsCount: 71,
    seats: 5,
    transmission: "Manual",
    fuelType: "Pertalite",
    baggage: 2,
    pricePerDay: 280000,
    driverPricePerDay: 200000,
    fuelPricePerDay: 110000,
    insurancePricePerDay: 40000,
    available: true,
    image: "/images/cars/ayla.webp",
    gallery: ["/images/cars/ayla.webp"]
  },
  {
    id: "mitsubishi-pajero-sport",
    name: "Mitsubishi Pajero Sport Dakar 4x2",
    category: "SUV Tangguh",
    rating: 4.96,
    reviewsCount: 162,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Dexlite / Pertamina Dex",
    baggage: 4,
    pricePerDay: 1100000,
    driverPricePerDay: 250000,
    fuelPricePerDay: 300000,
    insurancePricePerDay: 120000,
    available: true,
    image: "/images/cars/pajero-sport.webp",
    gallery: ["/images/cars/pajero-sport.webp"]
  },
  {
    id: "toyota-fortuner",
    name: "Toyota Fortuner 2.8 GR Sport",
    category: "SUV Tangguh",
    rating: 4.95,
    reviewsCount: 178,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Dexlite / Pertamina Dex",
    baggage: 4,
    pricePerDay: 1150000,
    driverPricePerDay: 250000,
    fuelPricePerDay: 300000,
    insurancePricePerDay: 120000,
    available: true,
    image: "/images/cars/fortuner.webp",
    gallery: ["/images/cars/fortuner.webp"]
  },
  {
    id: "honda-crv",
    name: "Honda CR-V 1.5 Turbo Prestige",
    category: "SUV Tangguh",
    rating: 4.92,
    reviewsCount: 115,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Pertamax Turbo",
    baggage: 4,
    pricePerDay: 950000,
    driverPricePerDay: 250000,
    fuelPricePerDay: 250000,
    insurancePricePerDay: 100000,
    available: true,
    image: "/images/cars/crv.webp",
    gallery: ["/images/cars/crv.webp"]
  },
  {
    id: "toyota-alphard",
    name: "Toyota Alphard Executive Lounge 2.5G",
    category: "Sedan Mewah / VIP",
    rating: 4.98,
    reviewsCount: 235,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Pertamax Turbo",
    baggage: 4,
    pricePerDay: 2200000,
    driverPricePerDay: 300000,
    fuelPricePerDay: 350000,
    insurancePricePerDay: 200000,
    available: true,
    image: "/images/cars/alphard.webp",
    gallery: ["/images/cars/alphard.webp"]
  },
  {
    id: "toyota-camry",
    name: "Toyota Camry 2.5 Hybrid VIP",
    category: "Sedan Mewah / VIP",
    rating: 4.93,
    reviewsCount: 96,
    seats: 5,
    transmission: "Automatic",
    fuelType: "Hybrid",
    baggage: 3,
    pricePerDay: 1400000,
    driverPricePerDay: 250000,
    fuelPricePerDay: 200000,
    insurancePricePerDay: 150000,
    available: true,
    image: "/images/cars/camry.webp",
    gallery: ["/images/cars/camry.webp"]
  },
  {
    id: "mercedes-benz-s-class",
    name: "Mercedes-Benz S-Class S450L VIP",
    category: "Sedan Mewah / VIP",
    rating: 4.99,
    reviewsCount: 142,
    seats: 5,
    transmission: "Automatic",
    fuelType: "Pertamax Turbo",
    baggage: 3,
    pricePerDay: 4500000,
    driverPricePerDay: 400000,
    fuelPricePerDay: 450000,
    insurancePricePerDay: 300000,
    available: true,
    image: "/images/cars/s-class.webp",
    gallery: ["/images/cars/s-class.webp"]
  },
  {
    id: "hyundai-ioniq-5",
    name: "Hyundai Ioniq 5 Signature Long Range",
    category: "Mobil Listrik (EV)",
    rating: 4.95,
    reviewsCount: 110,
    seats: 5,
    transmission: "Automatic",
    fuelType: "Electric",
    baggage: 3,
    pricePerDay: 1250000,
    driverPricePerDay: 250000,
    fuelPricePerDay: 80000,
    insurancePricePerDay: 100000,
    available: true,
    image: "/images/cars/ioniq5.webp",
    gallery: ["/images/cars/ioniq5.webp"]
  },
  {
    id: "wuling-air-ev",
    name: "Wuling Air EV Long Range",
    category: "Mobil Listrik (EV)",
    rating: 4.88,
    reviewsCount: 86,
    seats: 4,
    transmission: "Automatic",
    fuelType: "Electric",
    baggage: 2,
    pricePerDay: 450000,
    driverPricePerDay: 200000,
    fuelPricePerDay: 50000,
    insurancePricePerDay: 50000,
    available: true,
    image: "/images/cars/wuling-air.webp",
    gallery: ["/images/cars/wuling-air.webp"]
  },
  {
    id: "toyota-hiace",
    name: "Toyota Hiace Premio Luxury",
    category: "Minibus Wisata",
    rating: 4.96,
    reviewsCount: 156,
    seats: 14,
    transmission: "Manual",
    fuelType: "Dexlite / Pertamina Dex",
    baggage: 6,
    pricePerDay: 1300000,
    driverPricePerDay: 300000,
    fuelPricePerDay: 400000,
    insurancePricePerDay: 150000,
    available: true,
    image: "/images/cars/hiace.webp",
    gallery: ["/images/cars/hiace.webp"]
  },
  {
    id: "isuzu-elf",
    name: "Isuzu Elf Long NLR Microbus",
    category: "Minibus Wisata",
    rating: 4.90,
    reviewsCount: 112,
    seats: 19,
    transmission: "Manual",
    fuelType: "Solar (Biosolar)",
    baggage: 6,
    pricePerDay: 1450000,
    driverPricePerDay: 300000,
    fuelPricePerDay: 450000,
    insurancePricePerDay: 180000,
    available: true,
    image: "/images/cars/elf.webp",
    gallery: ["/images/cars/elf.webp"]
  },
  {
    id: "mercedes-c300-wedding",
    name: "Mercedes-Benz C300 White Wedding Edition",
    category: "Wedding Car",
    rating: 4.99,
    reviewsCount: 88,
    seats: 4,
    transmission: "Automatic",
    fuelType: "Pertamax Turbo",
    baggage: 2,
    pricePerDay: 2500000,
    driverPricePerDay: 350000,
    fuelPricePerDay: 300000,
    insurancePricePerDay: 200000,
    available: true,
    image: "/images/cars/mercedes-wedding.webp",
    gallery: ["/images/cars/mercedes-wedding.webp"]
  }
];

export interface Destination {
  id: string;
  name: string;
  suitableCars: string[]; // Car IDs
  description: string;
  image: string;
}

export const destinationsData: Destination[] = [
  {
    id: "bandung",
    name: "Bandung Executive Escape",
    suitableCars: ["toyota-avanza", "toyota-innova-reborn"],
    description: "Nikmati kenyamanan berkendara di daerah perbukitan Dago atau Lembang dengan Avanza lincah atau Kijang Innova.",
    image: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "yogyakarta",
    name: "Yogyakarta Heritage Tour",
    suitableCars: ["toyota-innova-reborn", "toyota-hiace"],
    description: "Jelajahi keindahan budaya Candi Borobudur dan Prambanan bersama keluarga besar menggunakan Innova Reborn atau Hiace Premio.",
    image: "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "bali",
    name: "Bali Island Vibe",
    suitableCars: ["honda-brio", "mitsubishi-xpander"],
    description: "Ciptakan momen tak terlupakan menyusuri jalanan pantai Seminyak dan Uluwatu dengan Brio yang lincah atau Xpander luas.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "bromo",
    name: "Bromo Mountain Adventure",
    suitableCars: ["toyota-innova-reborn", "isuzu-elf"],
    description: "Taklukkan medan menantang lautan pasir Gunung Bromo bersama rombongan menggunakan Innova Reborn atau Isuzu Elf.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800"
  }
];

export interface BlogPost {
  id: string;
  title: string;
  category: 'Tips' | 'Wisata' | 'Otomotif' | 'Lifestyle';
  date: string;
  snippet: string;
  image: string;
}

export const blogPostsData: BlogPost[] = [
  {
    id: "blog-1",
    title: "5 Tips Berkendara Aman Menggunakan Mobil Transmisi Matik",
    category: "Tips",
    date: "28 Juli 2026",
    snippet: "Bagi pemula maupun pengemudi kawakan, pahami cara kerja sistem pemindah daya modern untuk kenyamanan dan efisiensi bahan bakar maksimal.",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "blog-2",
    title: "Destinasi Road Trip Keluarga Terbaik di Jalur Pantai Selatan Jawa",
    category: "Wisata",
    date: "25 Juli 2026",
    snippet: "Temukan pantai-pantai eksotis yang belum terjamah di sepanjang Pansela menggunakan mobil MPV keluarga yang tangguh.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "blog-3",
    title: "Ulasan Fitur Keselamatan Kijang Innova Reborn Diesel",
    category: "Otomotif",
    date: "20 Juli 2026",
    snippet: "Kupas tuntas kehandalan suspensi double wishbone dan efisiensi mesin common rail turbo diesel pada seri Kijang terfavorit.",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800"
  }
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqsData: FAQItem[] = [
  {
    question: "Apa saja persyaratan utama sewa mobil lepas kunci?",
    answer: "Untuk sewa lepas kunci (tanpa sopir), Anda wajib menyerahkan foto KTP, SIM A aktif, bukti kepemilikan media sosial aktif (LinkedIn/Instagram), serta menyetujui penempatan deposit jaminan. Proses verifikasi dokumen memerlukan waktu maksimal 1x24 jam sebelum unit dikirim."
  },
  {
    question: "Apakah tarif sewa sudah termasuk bahan bakar (BBM) dan tol?",
    answer: "Secara default, harga sewa dasar belum termasuk BBM, tol, parkir, dan makan sopir (bila menggunakan driver). Namun, kami menyediakan paket tambahan 'Fuel Cover' dan 'Driver Full Service' dalam kalkulator harga interaktif kami untuk kemudahan perjalanan Anda."
  },
  {
    question: "Bagaimana kebijakan asuransi kerusakan kendaraan?",
    answer: "Seluruh armada Royal Drive dilindungi oleh asuransi All-Risk komprehensif. Jika terjadi kerusakan akibat kecelakaan, penyewa yang mengambil opsi proteksi penuh hanya dikenakan biaya klaim risiko sendiri (own risk) flat sebesar Rp 300.000 per kejadian, dan sisanya ditanggung penuh oleh pihak asuransi."
  },
  {
    question: "Apakah mobil bisa diantar langsung ke Bandara atau Hotel?",
    answer: "Ya. Kami melayani pengantaran dan penjemputan unit secara gratis untuk area perkotaan Jakarta, Bandung, Surabaya, dan Bali. Untuk pengantaran langsung ke Bandara, staf logistik kami akan stand-by di titik drop-off terminal kedatangan sesuai jadwal penerbangan Anda."
  },
  {
    question: "Bagaimana proses pengembalian dana deposit jaminan?",
    answer: "Uang deposit jaminan (security deposit) akan dikembalikan secara penuh via transfer bank dalam waktu maksimal 3 hari kerja setelah unit dikembalikan, setelah dipastikan tidak ada denda tilang elektronik (e-TLE) atau kerusakan eksterior/interior baru pada unit."
  }
];

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  videoThumb?: string;
  videoUrl?: string;
}

export const testimonialsData: Testimonial[] = [
  {
    id: "test-1",
    name: "Bambang Sudiro, S.E.",
    role: "Direktur PT Graha Sentosa Mandiri",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    text: "Layanan rental terbaik untuk operasional kantor dan tamu dinas di Jakarta & Tangerang. Unit Toyota Innova Reborn & Fortuner yang kami sewa sangat prima, bersih, dan harum. Driver sangat profesional, paham etika VIP, dan tepat waktu.",
    videoThumb: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "test-2",
    name: "Nadia Utami, S.I.Kom.",
    role: "Travel & Lifestyle Content Creator",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    text: "Sewa lepas kunci Honda Brio RS & Avanza di sini sangat memuaskan! Proses booking online dan verifikasi syarat cepat tanpa ribet via online. Mobil lincah, AC dingin, dan konsumsi BBM sangat irit selama keliling Tangerang & Jakarta.",
  },
  {
    id: "test-3",
    name: "Hendra Wijaya",
    role: "Owner PT Citra Logistik",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    text: "Kami sekeluarga sewa Toyota Alphard HEV untuk acara pernikahan keluarga. Unit sangat mewah, interior senyap, dan suspensinya nyaman untuk orang tua. Pelayanan admin 24 jam sangat ramah dan responsif saat koordinasi penjemputan.",
    videoThumb: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "test-4",
    name: "dr. Aris Munandar, Sp.PD.",
    role: "Dokter Spesialis & Konsultan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    text: "Sudah langganan sewa bulanan unit Innova Zenix untuk mobilitas antar rumah sakit. Unit selalu diservis rutin tepat waktu, surat-surat kendaraan lengkap, dan jika butuh sopir pengganti selalu siap standby.",
  }
];

export interface PricingSeason {
  id: string;
  name: string;
  type: "weekend" | "peak_season" | "holiday";
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  surchargePercent: number; // e.g. 15 for 15%
  isActive: boolean;
  description: string;
}

export const defaultPricingSeasons: PricingSeason[] = [
  {
    id: "season-weekend",
    name: "Tarif Akhir Pekan (Weekend Surcharge)",
    type: "weekend",
    surchargePercent: 10,
    isActive: true,
    description: "Penyesuaian tarif permintaan tinggi hari Sabtu & Minggu (+10%)."
  },
  {
    id: "season-nataru",
    name: "Peak Season Libur Nataru",
    type: "peak_season",
    startDate: "2026-12-20",
    endDate: "2027-01-05",
    surchargePercent: 30,
    isActive: true,
    description: "Puncak liburan Natal dan Tahun Baru sewa mobil keluarga (+30%)."
  },
  {
    id: "season-mudik",
    name: "Paket Mudik Hari Raya Idul Fitri",
    type: "peak_season",
    startDate: "2027-03-20",
    endDate: "2027-04-05",
    surchargePercent: 40,
    isActive: true,
    description: "Musim mudik lebaran antar-provinsi / silaturahmi keluarga tahunan (+40%)."
  }
];

export function calculateSeasonalAdjustment(
  startDateStr: string,
  endDateStr: string,
  baseDailyRate: number,
  seasons: PricingSeason[] = defaultPricingSeasons
): {
  totalSurcharge: number;
  breakdown: { name: string; percent: number; daysCount: number; amount: number }[];
  hasSurcharge: boolean;
} {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return { totalSurcharge: 0, breakdown: [], hasSurcharge: false };
  }

  const activeRules = seasons.filter(s => s.isActive);
  let totalSurcharge = 0;
  const appliedCounts: Record<string, { name: string; percent: number; count: number; amount: number }> = {};

  const current = new Date(start);
  while (current < end) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    const dateStr = current.toISOString().split("T")[0];

    // Check peak season first (highest priority)
    const peakMatch = activeRules.find(s => 
      s.type === "peak_season" && s.startDate && s.endDate && dateStr >= s.startDate && dateStr <= s.endDate
    );

    if (peakMatch) {
      const daySurcharge = Math.round((baseDailyRate * peakMatch.surchargePercent) / 100);
      totalSurcharge += daySurcharge;
      if (!appliedCounts[peakMatch.id]) {
        appliedCounts[peakMatch.id] = { name: peakMatch.name, percent: peakMatch.surchargePercent, count: 0, amount: 0 };
      }
      appliedCounts[peakMatch.id].count += 1;
      appliedCounts[peakMatch.id].amount += daySurcharge;
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Check weekend rule
      const weekendRule = activeRules.find(s => s.type === "weekend");
      if (weekendRule) {
        const daySurcharge = Math.round((baseDailyRate * weekendRule.surchargePercent) / 100);
        totalSurcharge += daySurcharge;
        if (!appliedCounts[weekendRule.id]) {
          appliedCounts[weekendRule.id] = { name: weekendRule.name, percent: weekendRule.surchargePercent, count: 0, amount: 0 };
        }
        appliedCounts[weekendRule.id].count += 1;
        appliedCounts[weekendRule.id].amount += daySurcharge;
      }
    }

    current.setDate(current.getDate() + 1);
  }

  const breakdown = Object.values(appliedCounts).map(item => ({
    name: item.name,
    percent: item.percent,
    daysCount: item.count,
    amount: item.amount,
  }));

  return {
    totalSurcharge,
    breakdown,
    hasSurcharge: totalSurcharge > 0,
  };
}
