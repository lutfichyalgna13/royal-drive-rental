"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, LayoutDashboard, Car, Calendar, Users, Sliders, LogOut, UserX, UserPlus, PhoneCall, History, ExternalLink, AlertOctagon, 
  ArrowLeft, Plus, Edit, Trash, Check, AlertCircle, BarChart3, TrendingUp, X, Sparkles,
  Tag, MessageSquare, HelpCircle, Star, Image, FileText, Play,
  Printer, FileCheck, ShieldCheck, UserCheck, ClipboardCheck, Phone, Eye, CheckCircle2, Download, Send, Search, CheckSquare, Square, FileSignature, Receipt,
  Wrench, Wallet, DollarSign, AlertTriangle, Clock, FileSpreadsheet, ArrowDownRight, ArrowUpRight,
  Menu, Lock, Key, Database, RefreshCw, UploadCloud, Upload,
  Copy, Filter, ArrowUpDown, Grid, List, CheckCheck,
  Bell, Volume2, VolumeX
} from "lucide-react";
import { Car as CarType, Testimonial, FAQItem, BlogPost, PricingSeason, defaultPricingSeasons, calculateSeasonalAdjustment, formatRupiah } from "../data/cars";
import { playNotificationChime, sendDesktopNotification, requestDesktopNotificationPermission } from "../utils/notifications";
import { safeSaveBookings } from "../utils/storage";

export interface MaintenanceRecord {
  id: string;
  carId: string;
  carName: string;
  carPlate: string;
  serviceDate: string;
  odometer: number;
  serviceType: "Ganti Oli Mesin" | "Kampas Rem" | "Tune Up & Busi" | "Ban & Spooring" | "AC & Kelistrikan" | "Body Repair / Cat" | "Servis Rutin Berkala";
  workshopName: string;
  cost: number;
  notes: string;
}

export interface VehicleCompliance {
  carId: string;
  carName: string;
  carPlate: string;
  taxExpiryDate: string; // YYYY-MM-DD
  plateExpiryDate: string; // YYYY-MM-DD
  lastServiceOdo: number;
  currentOdo: number;
  nextServiceOdo: number;
  insuranceName: string;
  insurancePolicyNo: string;
  insuranceExpiryDate: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: "Servis & Suku Cadang" | "Cuci & Salon Mobil" | "Uang Jalan / Gaji Driver" | "Pajak STNK & Asuransi" | "BBM Operasional" | "Lain-lain";
  carName?: string;
  carPlate?: string;
  amount: number;
  description: string;
  recordedBy: string;
}

export function terbilangRupiah(n: number): string {
  if (n === 0) return "Nol Rupiah";
  const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  const convert = (num: number): string => {
    let result = "";
    if (num < 12) {
      result = satuan[num];
    } else if (num < 20) {
      result = convert(num - 10) + " Belas";
    } else if (num < 100) {
      result = convert(Math.floor(num / 10)) + " Puluh " + convert(num % 10);
    } else if (num < 200) {
      result = "Seratus " + convert(num - 100);
    } else if (num < 1000) {
      result = convert(Math.floor(num / 100)) + " Ratus " + convert(num % 100);
    } else if (num < 2000) {
      result = "Seribu " + convert(num - 1000);
    } else if (num < 1000000) {
      result = convert(Math.floor(num / 1000)) + " Ribu " + convert(num % 1000);
    } else if (num < 1000000000) {
      result = convert(Math.floor(num / 1000000)) + " Juta " + convert(num % 1000000);
    } else if (num < 1000000000000) {
      result = convert(Math.floor(num / 1000000000)) + " Miliar " + convert(num % 1000000000);
    }
    return result.replace(/\s+/g, " ").trim();
  };
  return convert(Math.floor(Math.abs(n))) + " Rupiah";
}

const initialComplianceList: VehicleCompliance[] = [
  {
    carId: "toyota-avanza",
    carName: "Toyota Avanza 1.5G",
    carPlate: "B 1284 RD",
    taxExpiryDate: "2026-11-20",
    plateExpiryDate: "2029-11-20",
    lastServiceOdo: 20000,
    currentOdo: 28450,
    nextServiceOdo: 30000,
    insuranceName: "Garda Oto All-Risk",
    insurancePolicyNo: "GO-882910-JKT",
    insuranceExpiryDate: "2027-04-15",
  },
  {
    carId: "mitsubishi-xpander",
    carName: "Mitsubishi Xpander Ultimate",
    carPlate: "B 2011 RD",
    taxExpiryDate: "2026-09-24", // 13 hari lagi! (Alert)
    plateExpiryDate: "2028-09-24",
    lastServiceOdo: 30000,
    currentOdo: 39850,
    nextServiceOdo: 40000, // Sisa 150 KM! (Alert)
    insuranceName: "Asuransi Astra All-Risk",
    insurancePolicyNo: "AST-449102-ID",
    insuranceExpiryDate: "2027-01-10",
  },
  {
    carId: "toyota-innova-zenix",
    carName: "Toyota Innova Zenix Hybrid",
    carPlate: "B 1888 RD",
    taxExpiryDate: "2027-03-15",
    plateExpiryDate: "2029-03-15",
    lastServiceOdo: 10000,
    currentOdo: 14200,
    nextServiceOdo: 20000,
    insuranceName: "Sinarmas MSIG All-Risk",
    insurancePolicyNo: "SM-902114-JKT",
    insuranceExpiryDate: "2027-06-20",
  },
  {
    carId: "mitsubishi-pajero-sport",
    carName: "Mitsubishi Pajero Sport Dakar",
    carPlate: "B 2999 RD",
    taxExpiryDate: "2026-10-02", // 21 hari lagi!
    plateExpiryDate: "2028-10-02",
    lastServiceOdo: 40000,
    currentOdo: 50200, // Telat servis!
    nextServiceOdo: 50000,
    insuranceName: "ACA Insurance All-Risk",
    insurancePolicyNo: "ACA-109283-VIP",
    insuranceExpiryDate: "2027-05-12",
  },
  {
    carId: "toyota-alphard",
    carName: "Toyota Alphard Executive Lounge",
    carPlate: "B 1 RD",
    taxExpiryDate: "2027-08-10",
    plateExpiryDate: "2030-08-10",
    lastServiceOdo: 15000,
    currentOdo: 17800,
    nextServiceOdo: 25000,
    insuranceName: "Garda Oto Premium VIP",
    insurancePolicyNo: "GO-VIP-0001",
    insuranceExpiryDate: "2027-12-31",
  }
];

const initialMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: "SRV-101",
    carId: "toyota-avanza",
    carName: "Toyota Avanza 1.5G",
    carPlate: "B 1284 RD",
    serviceDate: "2026-08-15",
    odometer: 20000,
    serviceType: "Servis Rutin Berkala",
    workshopName: "Auto2000 Cilandak",
    cost: 1450000,
    notes: "Ganti oli mesin TMO 0W-20, filter oli, balancing roda depan."
  },
  {
    id: "SRV-102",
    carId: "mitsubishi-pajero-sport",
    carName: "Mitsubishi Pajero Sport Dakar",
    carPlate: "B 2999 RD",
    serviceDate: "2026-07-28",
    odometer: 40000,
    serviceType: "Kampas Rem",
    workshopName: "Dipo Star Motors Mitsubishi",
    cost: 2350000,
    notes: "Penggantian brake pad depan & belakang original Mitsubishi + kuras minyak rem."
  },
  {
    id: "SRV-103",
    carId: "toyota-alphard",
    carName: "Toyota Alphard Executive Lounge",
    carPlate: "B 1 RD",
    serviceDate: "2026-06-10",
    odometer: 15000,
    serviceType: "AC & Kelistrikan",
    workshopName: "Denso AC Specialist",
    cost: 950000,
    notes: "Fogging kabin bakteri, pembersihan filter kabin & cek tekanan freon."
  }
];

const initialExpenseRecords: ExpenseRecord[] = [
  {
    id: "EXP-201",
    date: "2026-09-08",
    category: "Cuci & Salon Mobil",
    carName: "Semua Unit Showroom",
    carPlate: "5 Mobil",
    amount: 250000,
    description: "Cuci hidrolik & vakum interior persiapan sewa akhir pekan.",
    recordedBy: "Staf Cuci & Pool"
  },
  {
    id: "EXP-202",
    date: "2026-09-05",
    category: "BBM Operasional",
    carName: "Toyota Avanza 1.5G",
    carPlate: "B 1284 RD",
    amount: 350000,
    description: "Isi bensin full tank saat antar unit ke Bandara Soetta.",
    recordedBy: "Driver Operasional"
  },
  {
    id: "EXP-203",
    date: "2026-09-01",
    category: "Pajak STNK & Asuransi",
    carName: "Daihatsu Xenia 1.3R",
    carPlate: "B 3102 RD",
    amount: 2450000,
    description: "Perpanjangan PKB tahunan di Samsat Jakarta Selatan.",
    recordedBy: "Admin Operasional"
  },
  {
    id: "EXP-204",
    date: "2026-08-30",
    category: "Uang Jalan / Gaji Driver",
    carName: "Innova Zenix",
    carPlate: "B 1888 RD",
    amount: 600000,
    description: "Uang saku sopir trip luar kota Jakarta-Bandung 2 hari.",
    recordedBy: "Admin Keuangan"
  }
];




export interface DriverRecord {
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

const initialDriversList: DriverRecord[] = [
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
    notes: "Spesialis antar jemput bandara & perjalanan keluarga santai."
  },
  {
    id: "DRV-004",
    name: "Bpk. Slamet Riyadi",
    phone: "081399887766",
    simNumber: "660192837465",
    simType: "SIM B1 Umum",
    simExpiry: "2026-10-30",
    status: "Off",
    rating: 4.92,
    totalTrips: 115,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
    notes: "Jadwal libur mingguan. Berpengalaman membawa Hiace Premio & bus pariwisata."
  }
];

export interface BookingRecord {
  id: string;
  client: string;
  phone: string;
  email: string;
  car: string;
  carPlate: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  totalPrice: number;
  depositAmount: number;
  paymentStatus: "DP Lunas" | "Lunas" | "Belum Bayar";
  rentalType: "Lepas Kunci" | "Dengan Sopir";
  status: "Pending" | "Active" | "Completed";
  date: string;
  driverName?: string;
  driverPhone?: string;
  driverPickupTime?: string;
  driverNotes?: string;
  pickupLocation?: string;
  paymentProofUrl?: string;
  paymentProofTime?: string;
  securityDepositAmount?: number;
  securityDepositStatus?: "Ditahan" | "Pemeriksaan ETLE" | "Refund Selesai" | "Dipotong Denda";
  refundBankName?: string;
  refundAccountNumber?: string;
  refundAccountName?: string;
  refundDate?: string;
  refundDeductionAmount?: number;
  refundDeductionReason?: string;
  documents: {
    ktpNumber: string;
    simNumber: string;
    ktpUrl: string;
    simUrl: string;
    emergencyName: string;
    emergencyPhone: string;
    emergencyRelation: string;
    socialMedia: string;
    verified: boolean;
  };
  inspection?: {
    checkOut?: {
      odometer: number;
      fuelLevel: "E" | "1/4" | "1/2" | "3/4" | "Full";
      scratches: string;
      itemsChecked: string[];
      inspector: string;
      time: string;
    };
    checkIn?: {
      odometer: number;
      fuelLevel: "E" | "1/4" | "1/2" | "3/4" | "Full";
      newDamages: string;
      extraFee: number;
      inspector: string;
      time: string;
    };
  };
  extensions?: {
    id: string;
    extendedDays: number;
    additionalCost: number;
    previousEndDate: string;
    newEndDate: string;
    requestTime: string;
    paymentStatus: "Lunas" | "Tagihan Akhir";
    notes?: string;
  }[];
}

interface AdminDashboardProps {
  cars: CarType[];
  setCars: (cars: CarType[]) => void;
  categories: string[];
  setCategories: (categories: string[]) => void;
  testimonials: Testimonial[];
  setTestimonials: (testimonials: Testimonial[]) => void;
  faqs: FAQItem[];
  setFaqs: (faqs: FAQItem[]) => void;
  heroTitle: string;
  setHeroTitle: (val: string) => void;
  heroSubtitle: string;
  setHeroSubtitle: (val: string) => void;
  bgImages: string[];
  setBgImages: (val: string[]) => void;
  brandName: string;
  setBrandName: (val: string) => void;
  logoUrl: string;
  setLogoUrl: (val: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (val: string) => void;
  contactPhone: string;
  setContactPhone: (val: string) => void;
  contactEmail: string;
  setContactEmail: (val: string) => void;
  showroomAddress: string;
  setShowroomAddress: (val: string) => void;
  googleMapsLink: string;
  setGoogleMapsLink: (val: string) => void;
  instagramUrl: string;
  setInstagramUrl: (val: string) => void;
  tiktokUrl: string;
  setTiktokUrl: (val: string) => void;
  facebookUrl: string;
  setFacebookUrl: (val: string) => void;
  whatsappTemplate: string;
  setWhatsappTemplate: (val: string) => void;
  rentalTerms: string;
  setRentalTerms: (val: string) => void;
  seoTitle: string;
  setSeoTitle: (val: string) => void;
  seoDescription: string;
  setSeoDescription: (val: string) => void;
  seoKeywords: string;
  setSeoKeywords: (val: string) => void;
  blogPosts: BlogPost[];
  setBlogPosts: (val: BlogPost[]) => void;
  onClose: () => void;
}

function compressImage(file: File, maxWidth = 1200, maxHeight = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions keeping aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
          const dataUrl = canvas.toDataURL(outputType, outputType === "image/jpeg" ? quality : undefined);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

const initialBookings: BookingRecord[] = [
  {
    id: "BK-9812",
    client: "Dian Pratama",
    phone: "081298765432",
    email: "dian.pratama@gmail.com",
    car: "Toyota Avanza 1.5G",
    carPlate: "B 1928 KFL",
    startDate: "2026-09-12",
    endDate: "2026-09-15",
    durationDays: 3,
    totalPrice: 1200000,
    depositAmount: 500000,
    paymentStatus: "DP Lunas",
    rentalType: "Lepas Kunci",
    status: "Pending",
    date: "11 Sep 2026",
    pickupLocation: "Bandara Soekarno-Hatta (T3)",
    documents: {
      ktpNumber: "3171051204920003",
      simNumber: "920412345678",
      ktpUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600",
      simUrl: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=600",
      emergencyName: "Rina Pratama",
      emergencyPhone: "081388776655",
      emergencyRelation: "Istri",
      socialMedia: "@dianpratama.id",
      verified: false,
    },
  },
  {
    id: "BK-9801",
    client: "Lutfi Utomo",
    phone: "085712345678",
    email: "lutfi.utomo@gmail.com",
    car: "Toyota Innova Zenix Hybrid",
    carPlate: "B 2049 RYD",
    startDate: "2026-09-10",
    endDate: "2026-09-12",
    durationDays: 2,
    totalPrice: 1600000,
    depositAmount: 1600000,
    paymentStatus: "Lunas",
    rentalType: "Dengan Sopir",
    driverName: "Bpk. Joko Santoso (0812-3344-5566)",
    status: "Active",
    date: "10 Sep 2026",
    pickupLocation: "Hotel Mulia Senayan",
    documents: {
      ktpNumber: "3273012903880002",
      simNumber: "880312349988",
      ktpUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
      simUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
      emergencyName: "Siti Rahmawati",
      emergencyPhone: "081299887711",
      emergencyRelation: "Keluarga",
      socialMedia: "@lutfi_utomo",
      verified: true,
    },
    inspection: {
      checkOut: {
        odometer: 24500,
        fuelLevel: "Full",
        scratches: "Baret tipis 2cm di ujung bumper kiri bawah. Interior bersih harum.",
        itemsChecked: ["STNK Asli", "Kunci Kontak", "Ban Serep", "Dongkrak", "Kotak P3K", "E-Toll"],
        inspector: "Bpk. Joko Santoso",
        time: "10 Sep 2026, 08:30 WIB",
      },
    },
  },
  {
    id: "BK-9742",
    client: "Hendra Wijaya",
    phone: "081399887766",
    email: "hendra.wijaya@corporate.co.id",
    car: "Toyota Alphard 2.5G",
    carPlate: "B 1 RYD",
    startDate: "2026-09-01",
    endDate: "2026-09-03",
    durationDays: 2,
    totalPrice: 4400000,
    depositAmount: 4400000,
    paymentStatus: "Lunas",
    rentalType: "Dengan Sopir",
    driverName: "Bpk. Rahmat Supriyadi",
    status: "Completed",
    date: "01 Sep 2026",
    pickupLocation: "Showroom Royal Drive",
    documents: {
      ktpNumber: "3174091508850001",
      simNumber: "850899887766",
      ktpUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
      simUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600",
      emergencyName: "Ratna Wijaya",
      emergencyPhone: "081199882233",
      emergencyRelation: "Istri",
      socialMedia: "@hendrawijaya",
      verified: true,
    },
    inspection: {
      checkOut: {
        odometer: 18200,
        fuelLevel: "Full",
        scratches: "Kondisi unit 100% mulus tanpa lecet.",
        itemsChecked: ["STNK Asli", "Kunci Kontak", "Ban Serep", "Dongkrak", "Kotak P3K", "E-Toll"],
        inspector: "Bpk. Rahmat Supriyadi",
        time: "01 Sep 2026, 07:00 WIB",
      },
      checkIn: {
        odometer: 18540,
        fuelLevel: "Full",
        newDamages: "Tidak ada kerusakan baru. Kondisi prima.",
        extraFee: 0,
        inspector: "Bpk. Rahmat Supriyadi",
        time: "03 Sep 2026, 20:00 WIB",
      },
    },
  },
];

export default function AdminDashboard({
  cars,
  setCars,
  categories,
  setCategories,
  testimonials,
  setTestimonials,
  faqs,
  setFaqs,
  heroTitle,
  setHeroTitle,
  heroSubtitle,
  setHeroSubtitle,
  bgImages,
  setBgImages,
  brandName,
  setBrandName,
  logoUrl,
  setLogoUrl,
  whatsappNumber,
  setWhatsappNumber,
  contactPhone,
  setContactPhone,
  contactEmail,
  setContactEmail,
  showroomAddress,
  setShowroomAddress,
  googleMapsLink,
  setGoogleMapsLink,
  instagramUrl,
  setInstagramUrl,
  tiktokUrl,
  setTiktokUrl,
  facebookUrl,
  setFacebookUrl,
  whatsappTemplate,
  setWhatsappTemplate,
  rentalTerms,
  setRentalTerms,
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  seoKeywords,
  setSeoKeywords,
  blogPosts,
  setBlogPosts,
  onClose 
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "fleet" | "bookings" | "drivers" | "maintenance" | "finance" | "testimonials" | "faqs" | "appearance" | "settings" | "blog">("analytics");
  const [appearanceSubTab, setAppearanceSubTab] = useState<"all" | "brand" | "hero" | "slideshow">("all");
  const [newSlideUrlInput, setNewSlideUrlInput] = useState("");
  const [isAddingSlideUrl, setIsAddingSlideUrl] = useState(false);
  const [logoInputMode, setLogoInputMode] = useState<"upload" | "url">("upload");
  const [settingsSubTab, setSettingsSubTab] = useState<"rates" | "contact" | "pricing" | "notif" | "security" | "all">("rates");
  const [bookings, setBookings] = useState<BookingRecord[]>(initialBookings);

  // Operational Modals State
  const [selectedVerificationBooking, setSelectedVerificationBooking] = useState<BookingRecord | null>(null);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<BookingRecord | null>(null);
  const [selectedContractBooking, setSelectedContractBooking] = useState<BookingRecord | null>(null);
  const [selectedInspectionBooking, setSelectedInspectionBooking] = useState<BookingRecord | null>(null);
  const [selectedProofBooking, setSelectedProofBooking] = useState<BookingRecord | null>(null);
  const [selectedDispatchBooking, setSelectedDispatchBooking] = useState<BookingRecord | null>(null);



  // Smart WhatsApp Template Modal State
  const [selectedWaBooking, setSelectedWaBooking] = useState<BookingRecord | null>(null);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waTemplateType, setWaTemplateType] = useState<"dp" | "ready" | "return" | "deposit">("dp");

  // Operational Pool Fleet Status (Ready, On Rent, Reserved, Maintenance)
  const [fleetPoolStatus, setFleetPoolStatus] = useState<Record<string, "ready" | "on_rent" | "reserved" | "maintenance">>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("royal_drive_fleet_pool_status_v1");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      "toyota-calya": "ready",
      "daihatsu-sigra": "on_rent",
      "toyota-avanza": "on_rent",
      "daihatsu-xenia": "ready",
      "mitsubishi-xpander": "ready",
      "toyota-innova-reborn": "on_rent",
      "toyota-innova-zenix": "reserved",
      "suzuki-ertiga": "ready",
      "honda-brio": "ready",
      "toyota-agya": "ready",
      "daihatsu-ayla": "ready",
      "mitsubishi-pajero-sport": "maintenance",
      "toyota-fortuner": "ready",
      "honda-crv": "ready",
      "toyota-alphard": "reserved",
      "toyota-camry": "ready",
      "mercedes-benz-s-class": "ready",
      "hyundai-ioniq-5": "ready",
      "wuling-air-ev": "ready",
      "toyota-hiace": "ready",
      "isuzu-elf": "ready",
      "mercedes-benz-c300": "reserved",
    };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("royal_drive_fleet_pool_status_v1", JSON.stringify(fleetPoolStatus));
      } catch (e) {}
    }
  }, [fleetPoolStatus]);

  const setCarOperationalStatus = (carId: string, status: "ready" | "on_rent" | "reserved" | "maintenance") => {
    setFleetPoolStatus(prev => ({
      ...prev,
      [carId]: status
    }));
  };



  // Open Smart WA modal
  const openSmartWaModal = (booking: BookingRecord, type: "dp" | "ready" | "return" | "deposit" = "dp") => {
    setSelectedWaBooking(booking);
    setWaTemplateType(type);
    setIsWaModalOpen(true);
  };

  // Today returning bookings calculation
  const todayStr = new Date().toISOString().split("T")[0];
  const todayReturningBookings = bookings.filter(b => 
    (b.status === "Active" || b.status === "Pending") && 
    (b.endDate <= todayStr)
  );

// Driver Management State
  const [drivers, setDrivers] = useState<DriverRecord[]>(initialDriversList);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState<boolean>(false);
  const [editingDriver, setEditingDriver] = useState<DriverRecord | null>(null);
  const [drvName, setDrvName] = useState<string>("");
  const [drvPhone, setDrvPhone] = useState<string>("");
  const [drvSimNum, setDrvSimNum] = useState<string>("");
  const [drvSimType, setDrvSimType] = useState<DriverRecord['simType']>("SIM A");
  const [drvSimExpiry, setDrvSimExpiry] = useState<string>("2028-12-31");
  const [drvStatus, setDrvStatus] = useState<DriverRecord['status']>("Standby");
  const [drvNotes, setDrvNotes] = useState<string>("");
  const [drvAvatar, setDrvAvatar] = useState<string>("");

  // Security Deposit Modal State
  const [selectedDepositBooking, setSelectedDepositBooking] = useState<BookingRecord | null>(null);
  const [depositAction, setDepositAction] = useState<"refund" | "deduct">("refund");
  const [refundBank, setRefundBank] = useState<string>("BCA");
  const [refundAccount, setRefundAccount] = useState<string>("");
  const [refundAccName, setRefundAccName] = useState<string>("");
  const [refundDeduction, setRefundDeduction] = useState<number>(0);
  const [refundDeductionReason, setRefundDeductionReason] = useState<string>("");

  // Vehicle Compliance & Maintenance State
  const [complianceList, setComplianceList] = useState<VehicleCompliance[]>(initialComplianceList);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(initialMaintenanceRecords);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>(initialExpenseRecords);

  // Maintenance Modals
  const [selectedCarForService, setSelectedCarForService] = useState<VehicleCompliance | null>(null);
  const [serviceDate, setServiceDate] = useState<string>("2026-09-11");
  const [serviceType, setServiceType] = useState<MaintenanceRecord['serviceType']>("Ganti Oli Mesin");
  const [serviceWorkshop, setServiceWorkshop] = useState<string>("Bengkel Resmi Rekanan");
  const [serviceOdo, setServiceOdo] = useState<number>(30000);
  const [serviceCost, setServiceCost] = useState<number>(1200000);
  const [serviceNotes, setServiceNotes] = useState<string>("Ganti oli mesin synthetic, filter oli, cek tekanan ban.");

  // Tax Modal
  const [selectedCarForTax, setSelectedCarForTax] = useState<VehicleCompliance | null>(null);
  const [newTaxExpiry, setNewTaxExpiry] = useState<string>("");
  const [newPlateExpiry, setNewPlateExpiry] = useState<string>("");
  const [taxCost, setTaxCost] = useState<number>(2500000);

  // Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [expDate, setExpDate] = useState<string>("2026-09-11");
  const [expCategory, setExpCategory] = useState<ExpenseRecord['category']>("Cuci & Salon Mobil");
  const [expCarName, setExpCarName] = useState<string>("Semua Unit Showroom");
  const [expAmount, setExpAmount] = useState<number>(200000);
  const [expDesc, setExpDesc] = useState<string>("Cuci hidrolik & vakum interior persiapan sewa");
  const [expRecorder, setExpRecorder] = useState<string>("Admin Operasional");

  // Invoice vs Kwitansi view toggle in modal
  const [invoiceDocType, setInvoiceDocType] = useState<"invoice" | "kwitansi">("invoice");

  // Driver dispatch sub-states
  const [dispatchDriverId, setDispatchDriverId] = useState<string>("");
  const [dispatchDriverName, setDispatchDriverName] = useState<string>("");
  const [dispatchDriverPhone, setDispatchDriverPhone] = useState<string>("");
  const [dispatchPickupTime, setDispatchPickupTime] = useState<string>("08:00 WIB");
  const [dispatchNotes, setDispatchNotes] = useState<string>("Bawa papan nama tamu, siapkan kartu E-Toll, pastikan kabin bersih harum.");

  // Fleet View Mode & User-Friendly Filters
  const [fleetViewMode, setFleetViewMode] = useState<"grid" | "table" | "schedule">("grid");
  const [fleetSearchQuery, setFleetSearchQuery] = useState<string>("");
  const [fleetCategoryFilter, setFleetCategoryFilter] = useState<string>("All");
  const [fleetStatusFilter, setFleetStatusFilter] = useState<"all" | "available" | "rented">("all");
  const [fleetSortBy, setFleetSortBy] = useState<"name-asc" | "name-desc" | "price-asc" | "price-desc" | "seats-desc">("name-asc");
  const [selectedCarForQuickDetail, setSelectedCarForQuickDetail] = useState<CarType | null>(null);

  // Dynamic Category Management Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [newCategoryInput, setNewCategoryInput] = useState<string>("");
  const [editingCatOldName, setEditingCatOldName] = useState<string | null>(null);
  const [editingCatNewName, setEditingCatNewName] = useState<string>("");

  // Inspection sub-states
  const [inspectionTab, setInspectionTab] = useState<"checkout" | "checkin">("checkout");
  const [inspOdometer, setInspOdometer] = useState<number>(25000);
  const [inspFuel, setInspFuel] = useState<"E" | "1/4" | "1/2" | "3/4" | "Full">("Full");
  const [inspScratches, setInspScratches] = useState<string>("Baret halus pemakaian normal.");
  const [inspItems, setInspItems] = useState<string[]>([
    "STNK Asli",
    "Kunci Kontak",
    "Ban Serep",
    "Dongkrak",
    "Kotak P3K",
    "E-Toll",
  ]);
  const [inspInspector, setInspInspector] = useState<string>("Admin Operasional");
  const [inspNewDamages, setInspNewDamages] = useState<string>("");
  const [inspExtraFee, setInspExtraFee] = useState<number>(0);
  const [inspOvertimeHours, setInspOvertimeHours] = useState<number>(0);

  // Dynamic Seasonal & Peak Pricing State
  const [pricingSeasons, setPricingSeasons] = useState<PricingSeason[]>(defaultPricingSeasons);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState<boolean>(false);
  const [editingSeason, setEditingSeason] = useState<PricingSeason | null>(null);
  const [seasonName, setSeasonName] = useState<string>("");
  const [seasonType, setSeasonType] = useState<PricingSeason['type']>("peak_season");
  const [seasonStart, setSeasonStart] = useState<string>("");
  const [seasonEnd, setSeasonEnd] = useState<string>("");
  const [seasonPercent, setSeasonPercent] = useState<number>(25);
  const [seasonDesc, setSeasonDesc] = useState<string>("");

  // Rental Extension Modal State
  const [selectedExtendBooking, setSelectedExtendBooking] = useState<BookingRecord | null>(null);
  const [extDays, setExtDays] = useState<number>(1);
  const [extNewEndDate, setExtNewEndDate] = useState<string>("");
  const [extPaymentStatus, setExtPaymentStatus] = useState<"Lunas" | "Tagihan Akhir">("Lunas");
  const [extNotes, setExtNotes] = useState<string>("");

  // Mobile Responsive Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Admin Security & Credentials State
  const [adminEmailSetting, setAdminEmailSetting] = useState<string>("admin@royaldrive.com");
  const [currAdminPass, setCurrAdminPass] = useState<string>("");
  const [newAdminPass, setNewAdminPass] = useState<string>("");
  const [confirmAdminPass, setConfirmAdminPass] = useState<string>("");

  // Filters for Bookings tab
  const [bookingFilterStatus, setBookingFilterStatus] = useState<"All" | "Pending" | "Active" | "Completed">("All");
  const [bookingSearchQuery, setBookingSearchQuery] = useState<string>("");

  // Real-time Booking Notification State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [desktopNotifState, setDesktopNotifState] = useState<NotificationPermission>("default");
  const [latestIncomingBooking, setLatestIncomingBooking] = useState<BookingRecord | null>(null);
  const [isIncomingAlertOpen, setIsIncomingAlertOpen] = useState<boolean>(false);
  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState<boolean>(false);

  // Load bookings and records from localStorage
  useEffect(() => {
    Promise.resolve().then(() => {
      if (typeof window !== "undefined") {
        const savedSound = localStorage.getItem("royal_drive_notif_sound");
        if (savedSound !== null) {
          setSoundEnabled(savedSound !== "false");
        }
        if ("Notification" in window) {
          setDesktopNotifState(Notification.permission);
        }

        const savedAuth = localStorage.getItem("royal_drive_admin_auth_v1");
        if (savedAuth) {
          try {
            const parsed = JSON.parse(savedAuth);
            if (parsed.email) setAdminEmailSetting(parsed.email);
          } catch (e) { console.error(e); }
        }
        const saved = localStorage.getItem("royal_drive_bookings_v2");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBookings(parsed);
            }
          } catch (e) {
            console.error(e);
          }
        }

        const savedComp = localStorage.getItem("royal_drive_compliance_v1");
        if (savedComp) {
          try {
            const parsed = JSON.parse(savedComp);
            if (Array.isArray(parsed) && parsed.length > 0) setComplianceList(parsed);
          } catch (e) { console.error(e); }
        }

        const savedMaint = localStorage.getItem("royal_drive_maintenance_v1");
        if (savedMaint) {
          try {
            const parsed = JSON.parse(savedMaint);
            if (Array.isArray(parsed) && parsed.length > 0) setMaintenanceRecords(parsed);
          } catch (e) { console.error(e); }
        }

        const savedExp = localStorage.getItem("royal_drive_expenses_v1");
        if (savedExp) {
          try {
            const parsed = JSON.parse(savedExp);
            if (Array.isArray(parsed) && parsed.length > 0) setExpenseRecords(parsed);
          } catch (e) { console.error(e); }
        }

        const savedDrivers = localStorage.getItem("royal_drive_drivers_v1");
        if (savedDrivers) {
          try {
            const parsed = JSON.parse(savedDrivers);
            if (Array.isArray(parsed) && parsed.length > 0) setDrivers(parsed);
          } catch (e) { console.error(e); }
        }

        fetch("/api/settings")
          .then((res) => res.json())
          .then((data) => {
            if (data?.success && data?.settings?.drivers && Array.isArray(data.settings.drivers) && data.settings.drivers.length > 0) {
              setDrivers(data.settings.drivers);
            }
          })
          .catch((err) => console.warn("Failed to fetch drivers from /api/settings:", err));

        const savedSeasons = localStorage.getItem("royal_drive_pricing_seasons_v1");
        if (savedSeasons) {
          try {
            const parsed = JSON.parse(savedSeasons);
            if (Array.isArray(parsed) && parsed.length > 0) setPricingSeasons(parsed);
          } catch (e) { console.error(e); }
        }
      }
    });

    if (typeof window !== "undefined") {
      const handleNewBooking = (e: Event) => {
        const customEvent = e as CustomEvent<BookingRecord>;
        if (customEvent.detail) {
          const incoming = customEvent.detail;
          setBookings(prev => {
            const exists = prev.some(b => b.id === incoming.id);
            if (exists) return prev;
            return [incoming, ...prev];
          });
          setLatestIncomingBooking(incoming);
          setIsIncomingAlertOpen(true);
          const soundPref = localStorage.getItem("royal_drive_notif_sound");
          if (soundPref !== "false") {
            playNotificationChime();
          }
        }
      };

      const handleStorage = (e: StorageEvent) => {
        if (e.key === "royal_drive_bookings_v2" && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBookings(parsed);
              const newest = parsed[0];
              if (newest && newest.status === "Pending") {
                setLatestIncomingBooking(newest);
                setIsIncomingAlertOpen(true);
                const soundPref = localStorage.getItem("royal_drive_notif_sound");
                if (soundPref !== "false") {
                  playNotificationChime();
                }
                const formattedPrice = new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0
                }).format(newest.totalPrice);
                sendDesktopNotification(
                  "🚨 Pemesanan Sewa Mobil Baru!",
                  `${newest.client} memesan ${newest.car} (${newest.durationDays} hari - ${formattedPrice})`
                );
              }
            }
          } catch (err) {
            console.error(err);
          }
        }
      };

      // Heartbeat Auto-Sync with Centralized Server API (/api/bookings)
      const syncWithServer = async () => {
        try {
          const res = await fetch("/api/bookings");
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.bookings) && data.bookings.length > 0) {
              setBookings(prev => {
                // Check if a new booking arrived from server (e.g. booked from a smartphone)
                const newest = data.bookings[0];
                const alreadyKnown = prev.some(b => b.id === newest.id);
                if (!alreadyKnown && newest.status === "Pending") {
                  setLatestIncomingBooking(newest);
                  setIsIncomingAlertOpen(true);
                  const soundPref = localStorage.getItem("royal_drive_notif_sound");
                  if (soundPref !== "false") {
                    playNotificationChime();
                  }
                  const formattedPrice = new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0
                  }).format(newest.totalPrice);
                  sendDesktopNotification(
                    "🚨 Pemesanan Sewa Mobil Baru!",
                    `${newest.client} memesan ${newest.car} (${newest.durationDays} hari - ${formattedPrice})`
                  );
                }
                safeSaveBookings(data.bookings);
                return data.bookings;
              });
            }
          }
        } catch {
          // Offline / fallback
        }
      };

      // Initial server sync
      syncWithServer();

      // Poll every 3 seconds for instant cross-device updates
      const pollInterval = setInterval(syncWithServer, 3000);

      window.addEventListener("royal_drive_new_booking", handleNewBooking);
      window.addEventListener("storage", handleStorage);

      return () => {
        clearInterval(pollInterval);
        window.removeEventListener("royal_drive_new_booking", handleNewBooking);
        window.removeEventListener("storage", handleStorage);
      };
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("royal_drive_notif_sound", String(next));
    }
    if (next) {
      playNotificationChime();
    }
  };

  const handleRequestDesktopPush = async () => {
    const perm = await requestDesktopNotificationPermission();
    setDesktopNotifState(perm);
    if (perm === "granted") {
      sendDesktopNotification(
        "🔔 Notifikasi Desktop Aktif",
        "Anda akan menerima notifikasi instan saat pelanggan memesan mobil rental."
      );
    }
  };

  const handleTestSound = () => {
    playNotificationChime();
  };

  const syncSettingsToServer = (partial: Record<string, any>) => {
    try {
      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...partial, lastUpdated: Date.now() }),
      }).catch((err) => console.warn("Sync to server failed:", err));
    } catch {}
  };

  const updateAndSaveCars = (newCars: CarType[]) => {
    setCars(newCars);
    if (typeof window !== "undefined") {
      localStorage.setItem("royal_drive_cars_v5", JSON.stringify(newCars));
      localStorage.setItem("royal_drive_cars", JSON.stringify(newCars));
    }
    syncSettingsToServer({ cars: newCars });
  };

  const updateAndSaveCategories = (newCats: string[]) => {
    setCategories(newCats);
    if (typeof window !== "undefined") {
      localStorage.setItem("royal_drive_categories_v2", JSON.stringify(newCats));
      localStorage.setItem("royal_drive_categories_v1", JSON.stringify(newCats));
    }
    syncSettingsToServer({ categories: newCats });
  };

  const updateAndSaveTestimonials = (newTestimonials: Testimonial[]) => {
    setTestimonials(newTestimonials);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("royal_drive_testimonials", JSON.stringify(newTestimonials)); } catch (e) {}
    }
    syncSettingsToServer({ testimonials: newTestimonials });
  };

  const updateAndSaveFaqs = (newFaqs: FAQItem[]) => {
    setFaqs(newFaqs);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("royal_drive_faqs", JSON.stringify(newFaqs)); } catch (e) {}
    }
    syncSettingsToServer({ faqs: newFaqs });
  };

  const updateAndSaveBlogPosts = (newPosts: BlogPost[]) => {
    setBlogPosts(newPosts);
    if (typeof window !== "undefined") {
      try { localStorage.setItem("royal_drive_blogPosts", JSON.stringify(newPosts)); } catch (e) {}
    }
    syncSettingsToServer({ blogPosts: newPosts });
  };

  const updateAndSaveBookings = (newBookings: BookingRecord[]) => {
    setBookings(newBookings);
    safeSaveBookings(newBookings);
    // Push updates to centralized server database
    try {
      fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookings: newBookings }),
      }).catch(() => {});
    } catch {
      // Offline fallback
    }
  };

  const savePricingSeasons = (list: PricingSeason[]) => {
    setPricingSeasons(list);
    if (typeof window !== "undefined") {
      localStorage.setItem("royal_drive_pricing_seasons_v1", JSON.stringify(list));
    }
    syncSettingsToServer({ pricingSeasons: list });
  };

  const saveDriversList = (list: DriverRecord[]) => {
    setDrivers(list);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("royal_drive_drivers_v1", JSON.stringify(list));
      } catch (e) {
        console.warn("Storage quota exceeded for drivers:", e);
      }
    }
    syncSettingsToServer({ drivers: list });
  };

  const saveComplianceList = (list: VehicleCompliance[]) => {
    setComplianceList(list);
    if (typeof window !== "undefined") {
      localStorage.setItem("royal_drive_compliance_v1", JSON.stringify(list));
    }
  };

  const saveMaintenanceRecords = (records: MaintenanceRecord[]) => {
    setMaintenanceRecords(records);
    if (typeof window !== "undefined") {
      localStorage.setItem("royal_drive_maintenance_v1", JSON.stringify(records));
    }
  };

  const saveExpenseRecords = (records: ExpenseRecord[]) => {
    setExpenseRecords(records);
    if (typeof window !== "undefined") {
      localStorage.setItem("royal_drive_expenses_v1", JSON.stringify(records));
    }
  };

  // Export bookings to CSV / Excel spreadsheet
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert("Belum ada data pemesanan untuk diexport.");
      return;
    }

    const headers = [
      "No Booking",
      "Tanggal Order",
      "Nama Penyewa",
      "Nomor HP",
      "Email",
      "Unit Mobil",
      "Nomor Plat",
      "Mulai Sewa",
      "Selesai Sewa",
      "Durasi (Hari)",
      "Layanan",
      "Sopir",
      "Total Biaya (Rp)",
      "DP (Rp)",
      "Status Pembayaran",
      "Status KTP",
      "Status Sewa",
      "Lokasi Penjemputan"
    ];

    const rows = bookings.map((b) => [
      `"${b.id}"`,
      `"${b.date}"`,
      `"${b.client.replace(/"/g, '""')}"`,
      `"${b.phone}"`,
      `"${b.email}"`,
      `"${b.car}"`,
      `"${b.carPlate}"`,
      `"${b.startDate}"`,
      `"${b.endDate}"`,
      b.durationDays,
      `"${b.rentalType}"`,
      `"${b.driverName || '-'}"`,
      b.totalPrice,
      b.depositAmount,
      `"${b.paymentStatus}"`,
      `"${b.documents.verified ? 'Valid' : 'Pending'}"`,
      `"${b.status}"`,
      `"${(b.pickupLocation || 'Showroom').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `rekap_booking_royal_drive_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real-time dynamic business metrics
  const dynamicTotalRevenue = bookings.reduce((sum, b) => {
    if (b.paymentStatus === "Lunas") return sum + b.totalPrice;
    if (b.paymentStatus === "DP Lunas") return sum + b.depositAmount;
    return sum;
  }, 0);

  const dynamicActiveBookingsCount = bookings.filter(b => b.status === "Active" || b.status === "Pending").length;
  
  const dynamicRentedCarsCount = cars.filter(c => !c.available).length;
  const dynamicUtilizationRate = cars.length > 0 ? Math.round((dynamicRentedCarsCount / cars.length) * 100) : 0;

  // Most booked car model
  const carCounts: Record<string, number> = {};
  bookings.forEach(b => {
    carCounts[b.car] = (carCounts[b.car] || 0) + 1;
  });
  let dynamicPopularCar = "Toyota Avanza";
  let maxCount = 0;
  for (const [cName, cnt] of Object.entries(carCounts)) {
    if (cnt > maxCount) {
      maxCount = cnt;
      dynamicPopularCar = cName;
    }
  }

  // Maintenance & Financial Ledger metrics
  const totalMaintenanceCost = maintenanceRecords.reduce((sum, m) => sum + m.cost, 0);
  const totalGeneralExpenses = expenseRecords.reduce((sum, e) => sum + e.amount, 0);
  const totalOutflow = totalMaintenanceCost + totalGeneralExpenses;
  const netProfit = dynamicTotalRevenue - totalOutflow;
  const profitMargin = dynamicTotalRevenue > 0 ? Math.round((netProfit / dynamicTotalRevenue) * 100) : 0;

  // Alerts for compliance
  const urgentTaxCount = complianceList.filter(c => {
    const days = Math.ceil((new Date(c.taxExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days <= 30;
  }).length;

  const urgentServiceCount = complianceList.filter(c => (c.nextServiceOdo - c.currentOdo) <= 500).length;

  // Export Financial Ledger to CSV
  const handleExportFinanceCSV = () => {
    const headers = ["ID Transaksi", "Tanggal", "Tipe Mutasi", "Kategori", "Keterangan", "Unit Terkait", "Pemasukan (Rp)", "Pengeluaran (Rp)"];
    const rows: (string | number)[][] = [];

    // Add bookings (inflow)
    bookings.filter(b => b.paymentStatus !== "Belum Bayar").forEach(b => {
      const amount = b.paymentStatus === "Lunas" ? b.totalPrice : b.depositAmount;
      rows.push([
        b.id,
        b.date,
        "Pemasukan Kas",
        `Rental Mobil (${b.paymentStatus})`,
        `Sewa ${b.car} oleh ${b.client} (${b.durationDays} hari)`,
        b.car,
        amount,
        0
      ]);
    });

    // Add maintenance (outflow)
    maintenanceRecords.forEach(m => {
      rows.push([
        m.id,
        m.serviceDate,
        "Pengeluaran Kas",
        `Bengkel (${m.serviceType})`,
        `${m.workshopName} - ${m.notes}`,
        m.carName,
        0,
        m.cost
      ]);
    });

    // Add general expenses (outflow)
    expenseRecords.forEach(e => {
      rows.push([
        e.id,
        e.date,
        "Pengeluaran Kas",
        e.category,
        e.description,
        e.carName || "Operasional Umum",
        0,
        e.amount
      ]);
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_keuangan_rental_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [settings, setSettings] = useState({
    depositAmount: 2000000,
    lateFeePerHour: 150000,
    driverServiceRate: 500000,
    taxRate: 11
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleSaveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("royal_drive_settings", JSON.stringify(settings));
      localStorage.setItem("royal_drive_whatsappNumber", whatsappNumber);
      localStorage.setItem("royal_drive_contactPhone", contactPhone);
      localStorage.setItem("royal_drive_contactEmail", contactEmail);
      localStorage.setItem("royal_drive_showroomAddress", showroomAddress);
      localStorage.setItem("royal_drive_googleMapsLink", googleMapsLink);
      localStorage.setItem("royal_drive_instagramUrl", instagramUrl);
      localStorage.setItem("royal_drive_tiktokUrl", tiktokUrl);
      localStorage.setItem("royal_drive_facebookUrl", facebookUrl);
      
      // Save new configurations
      localStorage.setItem("royal_drive_whatsappTemplate", whatsappTemplate);
      localStorage.setItem("royal_drive_rentalTerms", rentalTerms);
      localStorage.setItem("royal_drive_seoTitle", seoTitle);
      localStorage.setItem("royal_drive_seoDescription", seoDescription);
      localStorage.setItem("royal_drive_seoKeywords", seoKeywords);
    }

    // Server-wide sync for cross-device persistence (HP, Mobile, Laptop)
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        whatsappNumber,
        contactPhone,
        contactEmail,
        showroomAddress,
        googleMapsLink,
        instagramUrl,
        tiktokUrl,
        facebookUrl,
        whatsappTemplate,
        rentalTerms,
        seoTitle,
        seoDescription,
        seoKeywords,
        lastUpdated: Date.now(),
      }),
    }).catch((err) => console.warn("Sync settings to server failed:", err));

    setToastMessage("Konfigurasi Aturan, SEO, & Kontak berhasil disimpan!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveAppearance = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("royal_drive_brandName", brandName);
        localStorage.setItem("royal_drive_logoUrl", logoUrl);
        localStorage.setItem("royal_drive_heroTitle", heroTitle);
        localStorage.setItem("royal_drive_heroSubtitle", heroSubtitle);
        localStorage.setItem("royal_drive_bgImages", JSON.stringify(bgImages));
      } catch (error) {
        console.error("Gagal menyimpan tampilan ke local:", error);
      }
    }

    // Server-wide sync for cross-device persistence (HP, Mobile, Laptop)
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandName,
        logoUrl,
        heroTitle,
        heroSubtitle,
        bgImages,
        lastUpdated: Date.now(),
      }),
    })
      .then(() => {
        setToastMessage("Tampilan & Branding Website berhasil disimpan & disinkronkan ke seluruh perangkat!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((err) => {
        console.warn("Sync appearance to server failed:", err);
        setToastMessage("Tampilan berhasil disimpan di perangkat ini!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      });
  };

  const handleResetAppearance = () => {
    if (confirm("Apakah Anda yakin ingin me-reset tampilan website kembali ke bawaan pabrik (default)? Semua logo kustom dan gambar slide akan dihapus.")) {
      const defaultAppearance = {
        brandName: "RENTAL MOBIL",
        logoUrl: "/images/logo.png",
        heroTitle: "Temukan Mobil Terbaik",
        heroSubtitle: "SEWA MOBIL HARIAN, MINGGUAN, BULANAN DENGAN UNIT PRIMA HARGA TERBAIK.",
        bgImages: [
          "/images/hero-banner.webp",
          "/images/cars/suv-banner.webp",
          "/images/cars/fleet-banner.webp"
        ],
        lastUpdated: Date.now(),
      };

      if (typeof window !== "undefined") {
        localStorage.removeItem("royal_drive_brandName");
        localStorage.removeItem("royal_drive_logoUrl");
        localStorage.removeItem("royal_drive_heroTitle");
        localStorage.removeItem("royal_drive_heroSubtitle");
        localStorage.removeItem("royal_drive_bgImages");
        
        // Reset states in parent
        setBrandName(defaultAppearance.brandName);
        setLogoUrl(defaultAppearance.logoUrl);
        setHeroTitle(defaultAppearance.heroTitle);
        setHeroSubtitle(defaultAppearance.heroSubtitle);
        setBgImages(defaultAppearance.bgImages);
      }

      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultAppearance),
      }).catch((err) => console.warn("Reset appearance server sync failed:", err));

      setToastMessage("Tampilan berhasil di-reset ke default!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("royal_drive_settings");
        if (saved) {
          try {
            setSettings(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
  }, []);

  // Modal State for Add/Edit Car
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarType | null>(null);

  // Form Fields State
  const [carName, setCarName] = useState("");
  const [carCategory, setCarCategory] = useState<CarType['category']>("MPV Keluarga");
  const [carSeats, setCarSeats] = useState(7);
  const [carTransmission, setCarTransmission] = useState<CarType['transmission']>("Automatic");
  const [carFuelType, setCarFuelType] = useState<CarType['fuelType']>("Pertamax");
  const [carPrice, setCarPrice] = useState(400000);
  const [carImage, setCarImage] = useState("");

  // Sync fields when editing car changes
  useEffect(() => {
    Promise.resolve().then(() => {
      if (editingCar) {
        setCarName(editingCar.name);
        setCarCategory(editingCar.category);
        setCarSeats(editingCar.seats);
        setCarTransmission(editingCar.transmission);
        setCarFuelType(editingCar.fuelType);
        setCarPrice(editingCar.pricePerDay);
        setCarImage(editingCar.image);
      } else {
        // Clear to defaults for adding new car
        setCarName("");
        setCarCategory("MPV Keluarga");
        setCarSeats(7);
        setCarTransmission("Automatic");
        setCarFuelType("Pertamax");
        setCarPrice(400000);
        setCarImage("");
      }
    });
  }, [editingCar, isFormOpen]);

  // Modal State for Add/Edit Blog Post
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);

  // Blog Form Fields State
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState<BlogPost['category']>("Tips");
  const [blogDate, setBlogDate] = useState("");
  const [blogSnippet, setBlogSnippet] = useState("");
  const [blogImage, setBlogImage] = useState("");

  // Sync fields when editing blog changes
  useEffect(() => {
    Promise.resolve().then(() => {
      if (editingBlogPost) {
        setBlogTitle(editingBlogPost.title);
        setBlogCategory(editingBlogPost.category);
        setBlogDate(editingBlogPost.date);
        setBlogSnippet(editingBlogPost.snippet);
        setBlogImage(editingBlogPost.image);
      } else {
        // Clear to defaults for adding new blog post
        setBlogTitle("");
        setBlogCategory("Tips");
        const formatIndoDate = (date: Date) => {
          const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
          return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        };
        setBlogDate(formatIndoDate(new Date()));
        setBlogSnippet("");
        setBlogImage("");
      }
    });
  }, [editingBlogPost, isBlogFormOpen]);

  const handleBlogFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImage = blogImage.trim();
    if (!finalImage) {
      finalImage = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800";
    }

    if (editingBlogPost) {
      const updated = blogPosts.map(post => 
        post.id === editingBlogPost.id 
          ? {
              ...post,
              title: blogTitle,
              category: blogCategory,
              date: blogDate,
              snippet: blogSnippet,
              image: finalImage
            }
          : post
      );
      updateAndSaveBlogPosts(updated);
      alert("Artikel berhasil diperbarui!");
    } else {
      const newPost: BlogPost = {
        id: "blog-" + Date.now(),
        title: blogTitle,
        category: blogCategory,
        date: blogDate,
        snippet: blogSnippet,
        image: finalImage
      };
      updateAndSaveBlogPosts([newPost, ...blogPosts]);
      alert("Artikel baru berhasil ditambahkan!");
    }

    setIsBlogFormOpen(false);
  };

  // Modal State for Add/Edit Testimonial
  const [isTestimonialFormOpen, setIsTestimonialFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Testimonial Form Fields State
  const [testimonialName, setTestimonialName] = useState("");
  const [testimonialRole, setTestimonialRole] = useState("");
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [testimonialText, setTestimonialText] = useState("");
  const [testimonialAvatar, setTestimonialAvatar] = useState("");
  const [testimonialVideoThumb, setTestimonialVideoThumb] = useState("");
  const [testimonialVideoUrl, setTestimonialVideoUrl] = useState("");

  // Sync fields when editing testimonial changes
  useEffect(() => {
    Promise.resolve().then(() => {
      if (editingTestimonial) {
        setTestimonialName(editingTestimonial.name);
        setTestimonialRole(editingTestimonial.role);
        setTestimonialRating(editingTestimonial.rating);
        setTestimonialText(editingTestimonial.text);
        setTestimonialAvatar(editingTestimonial.avatar);
        setTestimonialVideoThumb(editingTestimonial.videoThumb || "");
        setTestimonialVideoUrl(editingTestimonial.videoUrl || "");
      } else {
        setTestimonialName("");
        setTestimonialRole("");
        setTestimonialRating(5);
        setTestimonialText("");
        setTestimonialAvatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150");
        setTestimonialVideoThumb("");
        setTestimonialVideoUrl("");
      }
    });
  }, [editingTestimonial, isTestimonialFormOpen]);

  const handleTestimonialFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalAvatar = testimonialAvatar.trim() || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150";

    if (editingTestimonial) {
      const updated = testimonials.map(t => 
        t.id === editingTestimonial.id 
          ? {
              ...t,
              name: testimonialName,
              role: testimonialRole,
              rating: testimonialRating,
              text: testimonialText,
              avatar: finalAvatar,
              videoThumb: testimonialVideoThumb.trim() || undefined,
              videoUrl: testimonialVideoUrl.trim() || undefined
            }
          : t
      );
      updateAndSaveTestimonials(updated);
      alert("Testimoni dan foto profil pelanggan berhasil diperbarui!");
    } else {
      const newTest: Testimonial = {
        id: `test-${Date.now()}`,
        name: testimonialName,
        role: testimonialRole,
        rating: testimonialRating,
        text: testimonialText,
        avatar: finalAvatar,
        videoThumb: testimonialVideoThumb.trim() || undefined,
        videoUrl: testimonialVideoUrl.trim() || undefined
      };
      const updated = [...testimonials, newTest];
      updateAndSaveTestimonials(updated);
      alert("Testimoni dan profil baru berhasil ditambahkan!");
    }

    setIsTestimonialFormOpen(false);
  };

  const formatCurrency = (val: number) => formatRupiah(val);

  const handleApproveBooking = (id: string) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: "Active" as const } : b);
    updateAndSaveBookings(updated);
    setToastMessage("Pesanan sewa berhasil disetujui & berstatus Berjalan!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCompleteBooking = (id: string) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: "Completed" as const, paymentStatus: "Lunas" as const } : b);
    updateAndSaveBookings(updated);
    setToastMessage("Pesanan sewa telah selesai & unit siap kembali ke pool!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleVerifyDocuments = (bookingId: string) => {
    const updated = bookings.map(b => b.id === bookingId ? {
      ...b,
      documents: { ...b.documents, verified: true }
    } : b);
    updateAndSaveBookings(updated);
    if (selectedVerificationBooking && selectedVerificationBooking.id === bookingId) {
      setSelectedVerificationBooking({
        ...selectedVerificationBooking,
        documents: { ...selectedVerificationBooking.documents, verified: true }
      });
    }
    setToastMessage("Berkas KTP & SIM penyewa berhasil diverifikasi resmi!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleOpenInspection = (booking: BookingRecord) => {
    setSelectedInspectionBooking(booking);
    setInspOvertimeHours(0);
    if (booking.inspection?.checkOut) {
      setInspOdometer(booking.inspection.checkOut.odometer);
      setInspFuel(booking.inspection.checkOut.fuelLevel);
      setInspScratches(booking.inspection.checkOut.scratches);
      setInspItems(booking.inspection.checkOut.itemsChecked || []);
      setInspInspector(booking.inspection.checkOut.inspector);
      setInspectionTab("checkin");
      setInspNewDamages(booking.inspection.checkIn?.newDamages || "");
      setInspExtraFee(booking.inspection.checkIn?.extraFee || 0);
    } else {
      setInspectionTab("checkout");
      setInspOdometer(25000);
      setInspFuel("Full");
      setInspScratches("Kondisi bodi normal, bersih rapi.");
      setInspItems(["STNK Asli", "Kunci Kontak", "Ban Serep", "Dongkrak", "Kotak P3K", "E-Toll"]);
      setInspInspector("Admin Operasional");
    }
  };

  const handleSaveCheckOutInspection = () => {
    if (!selectedInspectionBooking) return;
    const nowStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    const updated = bookings.map(b => {
      if (b.id === selectedInspectionBooking.id) {
        return {
          ...b,
          status: "Active" as const,
          inspection: {
            ...b.inspection,
            checkOut: {
              odometer: inspOdometer,
              fuelLevel: inspFuel,
              scratches: inspScratches,
              itemsChecked: inspItems,
              inspector: inspInspector || "Staff Operasional",
              time: nowStr,
            }
          }
        };
      }
      return b;
    });
    updateAndSaveBookings(updated);
    setSelectedInspectionBooking(null);
    setToastMessage("Inspeksi Serah Terima Keluar (Check-out) berhasil disimpan!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveCheckInInspection = () => {
    if (!selectedInspectionBooking) return;
    const nowStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
    const updated = bookings.map(b => {
      if (b.id === selectedInspectionBooking.id) {
        return {
          ...b,
          status: "Completed" as const,
          paymentStatus: "Lunas" as const,
          inspection: {
            ...b.inspection,
            checkIn: {
              odometer: inspOdometer,
              fuelLevel: inspFuel,
              newDamages: inspNewDamages || "Tidak ada kerusakan baru.",
              extraFee: inspExtraFee,
              inspector: inspInspector || "Staff Operasional",
              time: nowStr,
            }
          }
        };
      }
      return b;
    });
    updateAndSaveBookings(updated);
    setSelectedInspectionBooking(null);
    setToastMessage("Inspeksi Pengembalian (Check-in) selesai! Pesanan ditandai Selesai.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Driver Management Handlers
  const handleOpenAddDriver = () => {
    setEditingDriver(null);
    setDrvName("");
    setDrvPhone("");
    setDrvSimNum("");
    setDrvSimType("SIM A");
    setDrvSimExpiry("2028-12-31");
    setDrvStatus("Standby");
    setDrvNotes("");
    setDrvAvatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200");
    setIsDriverModalOpen(true);
  };

  const handleOpenEditDriver = (driver: DriverRecord) => {
    setEditingDriver(driver);
    setDrvName(driver.name);
    setDrvPhone(driver.phone);
    setDrvSimNum(driver.simNumber);
    setDrvSimType(driver.simType);
    setDrvSimExpiry(driver.simExpiry);
    setDrvStatus(driver.status);
    setDrvNotes(driver.notes || "");
    setDrvAvatar(driver.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200");
    setIsDriverModalOpen(true);
  };

  const handleDeleteDriver = (driverId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus driver ini dari daftar showroom?")) {
      const updated = drivers.filter(d => d.id !== driverId);
      saveDriversList(updated);
      setToastMessage("Driver berhasil dihapus!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleDriverFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drvName.trim() || !drvPhone.trim()) {
      alert("Nama driver dan nomor telepon wajib diisi!");
      return;
    }

    const finalAvatar = drvAvatar.trim() || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200";

    if (editingDriver) {
      const updated = drivers.map(d => 
        d.id === editingDriver.id
          ? {
              ...d,
              name: drvName,
              phone: drvPhone,
              simNumber: drvSimNum,
              simType: drvSimType,
              simExpiry: drvSimExpiry,
              status: drvStatus,
              notes: drvNotes,
              avatarUrl: finalAvatar,
            }
          : d
      );
      saveDriversList(updated);
      setToastMessage("Data dan foto profil driver berhasil diperbarui!");
    } else {
      const newDriver: DriverRecord = {
        id: `DRV-${Date.now().toString().slice(-4)}`,
        name: drvName,
        phone: drvPhone,
        simNumber: drvSimNum || "SIM-" + Math.floor(100000000000 + Math.random() * 900000000000),
        simType: drvSimType,
        simExpiry: drvSimExpiry,
        status: drvStatus,
        rating: 5.0,
        totalTrips: 0,
        avatarUrl: finalAvatar,
        notes: drvNotes,
      };
      saveDriversList([...drivers, newDriver]);
      setToastMessage("Driver baru berhasil ditambahkan!");
    }

    setIsDriverModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Security Deposit Handler
  const handleSaveSecurityDeposit = (bookingId: string, newStatus: BookingRecord['securityDepositStatus']) => {
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          securityDepositAmount: b.securityDepositAmount || 1000000,
          securityDepositStatus: newStatus,
          refundBankName: refundBank,
          refundAccountNumber: refundAccount,
          refundAccountName: refundAccName,
          refundDate: new Date().toISOString().split("T")[0],
          refundDeductionAmount: newStatus === "Dipotong Denda" ? refundDeduction : 0,
          refundDeductionReason: newStatus === "Dipotong Denda" ? refundDeductionReason : undefined,
        };
      }
      return b;
    });
    updateAndSaveBookings(updated);
    setSelectedDepositBooking(null);
    setToastMessage(`Status jaminan deposit pesanan ${bookingId} berhasil diperbarui!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Rental Extension Handlers
  const handleOpenExtendBooking = (booking: BookingRecord) => {
    setSelectedExtendBooking(booking);
    setExtDays(1);
    const currEnd = new Date(booking.endDate);
    currEnd.setDate(currEnd.getDate() + 1);
    setExtNewEndDate(currEnd.toISOString().split("T")[0]);
    setExtPaymentStatus("Lunas");
    setExtNotes("Permintaan penambahan durasi sewa oleh penyewa.");
  };

  const handleConfirmExtension = () => {
    if (!selectedExtendBooking) return;
    const carObj = cars.find(c => c.name.toLowerCase() === selectedExtendBooking.car.toLowerCase());
    const dailyPrice = carObj 
      ? carObj.pricePerDay + (selectedExtendBooking.rentalType === "Dengan Sopir" ? carObj.driverPricePerDay : 0)
      : Math.round(selectedExtendBooking.totalPrice / (selectedExtendBooking.durationDays || 1));
    const addedCost = extDays * dailyPrice;

    const newExt = {
      id: `EXT-${Date.now()}`,
      extendedDays: extDays,
      additionalCost: addedCost,
      previousEndDate: selectedExtendBooking.endDate,
      newEndDate: extNewEndDate,
      requestTime: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
      paymentStatus: extPaymentStatus,
      notes: extNotes || undefined,
    };

    const updated = bookings.map(b => 
      b.id === selectedExtendBooking.id
        ? {
            ...b,
            endDate: extNewEndDate,
            durationDays: b.durationDays + extDays,
            totalPrice: b.totalPrice + addedCost,
            extensions: [...(b.extensions || []), newExt]
          }
        : b
    );
    updateAndSaveBookings(updated);
    setSelectedExtendBooking(null);
    setToastMessage(`Sewa ${selectedExtendBooking.car} berhasil diperpanjang +${extDays} hari (${formatCurrency(addedCost)})!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Seasonal Pricing Handlers
  const handleToggleSeason = (seasonId: string) => {
    const updated = pricingSeasons.map(s => s.id === seasonId ? { ...s, isActive: !s.isActive } : s);
    savePricingSeasons(updated);
    const target = updated.find(s => s.id === seasonId);
    setToastMessage(`Aturan tarif "${target?.name}" ${target?.isActive ? "diaktifkan" : "dinonaktifkan"}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleUpdateSeasonPercent = (seasonId: string, percent: number) => {
    const updated = pricingSeasons.map(s => s.id === seasonId ? { ...s, surchargePercent: percent } : s);
    savePricingSeasons(updated);
  };

  const handleOpenAddSeason = () => {
    setEditingSeason(null);
    setSeasonName("");
    setSeasonType("peak_season");
    setSeasonStart("2026-12-24");
    setSeasonEnd("2027-01-02");
    setSeasonPercent(25);
    setSeasonDesc("");
    setIsSeasonModalOpen(true);
  };

  const handleSaveSeason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seasonName.trim()) {
      alert("Nama musim / periode libur wajib diisi!");
      return;
    }

    if (editingSeason) {
      const updated = pricingSeasons.map(s => s.id === editingSeason.id ? {
        ...s,
        name: seasonName,
        type: seasonType,
        startDate: seasonType === "weekend" ? undefined : seasonStart,
        endDate: seasonType === "weekend" ? undefined : seasonEnd,
        surchargePercent: seasonPercent,
        description: seasonDesc
      } : s);
      savePricingSeasons(updated);
      setToastMessage("Aturan tarif musiman berhasil diperbarui!");
    } else {
      const newSeason: PricingSeason = {
        id: `season-${Date.now()}`,
        name: seasonName,
        type: seasonType,
        startDate: seasonType === "weekend" ? undefined : seasonStart,
        endDate: seasonType === "weekend" ? undefined : seasonEnd,
        surchargePercent: seasonPercent,
        isActive: true,
        description: seasonDesc || `Penyesuaian tarif ${seasonName} (+${seasonPercent}%)`
      };
      savePricingSeasons([...pricingSeasons, newSeason]);
      setToastMessage("Aturan tarif musiman baru berhasil ditambahkan!");
    }

    setIsSeasonModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeleteSeason = (seasonId: string) => {
    if (confirm("Hapus aturan penyesuaian tarif musim ini?")) {
      const updated = pricingSeasons.filter(s => s.id !== seasonId);
      savePricingSeasons(updated);
      setToastMessage("Aturan tarif berhasil dihapus!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Full Showroom Backup (.JSON)
  const handleExportFullBackup = () => {
    try {
      const backupData = {
        app: "ROYAL_DRIVE_SHOWROOM_BACKUP",
        version: "2.0",
        exportDate: new Date().toISOString(),
        brandName,
        whatsappNumber,
        settings,
        categories,
        cars,
        bookings,
        drivers,
        complianceList,
        maintenanceRecords,
        expenseRecords,
        pricingSeasons,
        testimonials,
        faqs,
        blogPosts
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `backup_database_royal_drive_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToastMessage("Cadangan database showroom (.JSON) berhasil diunduh!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (err) {
      console.error(err);
      alert("Gagal membuat berkas cadangan database.");
    }
  };

  // Restore Showroom Backup (.JSON)
  const handleImportFullBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (!data || (data.app !== "ROYAL_DRIVE_SHOWROOM_BACKUP" && !data.bookings && !data.cars)) {
          alert("Format file tidak valid. Pastikan Anda mengunggah file cadangan JSON resmi dari sistem ini.");
          return;
        }

        if (confirm("Peringatan: Memulihkan database akan menimpa data yang ada saat ini. Apakah Anda yakin ingin melanjutkan?")) {
          if (Array.isArray(data.categories)) {
            setCategories(data.categories);
            localStorage.setItem("royal_drive_categories_v1", JSON.stringify(data.categories));
          }
          if (Array.isArray(data.cars)) setCars(data.cars);
          if (Array.isArray(data.bookings)) updateAndSaveBookings(data.bookings);
          if (Array.isArray(data.drivers)) saveDriversList(data.drivers);
          if (Array.isArray(data.complianceList)) saveComplianceList(data.complianceList);
          if (Array.isArray(data.maintenanceRecords)) saveMaintenanceRecords(data.maintenanceRecords);
          if (Array.isArray(data.expenseRecords)) saveExpenseRecords(data.expenseRecords);
          if (Array.isArray(data.pricingSeasons)) savePricingSeasons(data.pricingSeasons);
          if (Array.isArray(data.testimonials)) setTestimonials(data.testimonials);
          if (Array.isArray(data.faqs)) setFaqs(data.faqs);
          if (Array.isArray(data.blogPosts)) setBlogPosts(data.blogPosts);

          setToastMessage("Database showroom berhasil dipulihkan secara menyeluruh!");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        }
      } catch (err) {
        console.error(err);
        alert("Gagal memproses file JSON. File mungkin rusak atau tidak sesuai skema.");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Change Admin Password
  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPass.trim()) {
      alert("Password baru tidak boleh kosong!");
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      alert("Konfirmasi password baru tidak cocok!");
      return;
    }

    // Verify current password
    let currentValid = false;
    try {
      const savedAuth = localStorage.getItem("royal_drive_admin_auth_v1");
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed.passwordHash) {
          currentValid = btoa(currAdminPass.trim()) === parsed.passwordHash;
        } else if (parsed.password) {
          currentValid = currAdminPass.trim() === parsed.password;
        }
      } else {
        currentValid = currAdminPass.trim() === "admin";
      }
    } catch {
      currentValid = currAdminPass.trim() === "admin";
    }

    if (!currentValid) {
      alert("Password lama yang Anda masukkan salah!");
      return;
    }

    // Save new credentials
    const newAuth = {
      email: adminEmailSetting.trim().toLowerCase(),
      passwordHash: btoa(newAdminPass.trim()),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem("royal_drive_admin_auth_v1", JSON.stringify(newAuth));
    setCurrAdminPass("");
    setNewAdminPass("");
    setConfirmAdminPass("");
    setToastMessage("Kredensial dan Password Administrator berhasil diperbarui!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Open Form for Adding new car
  const handleOpenAddForm = () => {
    setEditingCar(null);
    setIsFormOpen(true);
  };

  // Open Form for Editing existing car
  const handleOpenEditForm = (car: CarType) => {
    setEditingCar(car);
    setIsFormOpen(true);
  };

  // Toggle Car Availability (Siap Sewa vs Tersewa)
  const handleToggleCarAvailability = (id: string) => {
    const target = cars.find(c => c.id === id);
    const newStatus = target ? !target.available : true;
    const updated = cars.map(c => c.id === id ? { ...c, available: newStatus } : c);
    updateAndSaveCars(updated);
    setToastMessage(`Status "${target?.name || 'Mobil'}" diubah menjadi ${newStatus ? 'Tersedia (Siap Sewa)' : 'Sedang Tersewa'}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Delete Car with confirmation & notification
  const handleDeleteCar = (carId: string) => {
    const target = cars.find(c => c.id === carId);
    if (confirm(`Apakah Anda yakin ingin menghapus "${target?.name || 'mobil ini'}" dari daftar armada showroom?`)) {
      const updated = cars.filter((c) => c.id !== carId);
      updateAndSaveCars(updated);
      setToastMessage(`Mobil "${target?.name || 'Unit'}" berhasil dihapus dari armada.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // 1-Click Duplicate Car (Kembaran Unit)
  const handleDuplicateCar = (car: CarType) => {
    const cleanBaseName = car.name.replace(/\s*\(Unit\s*\d+\)/i, '').trim();
    const copyCount = cars.filter(c => c.name.startsWith(cleanBaseName)).length + 1;
    const duplicateName = `${cleanBaseName} (Unit ${copyCount})`;
    const duplicateId = `${car.id}-copy-${Date.now()}`;
    const duplicatedCar: CarType = {
      ...car,
      id: duplicateId,
      name: duplicateName,
      available: true,
    };
    updateAndSaveCars([duplicatedCar, ...cars]);
    setToastMessage(`Unit kembaran "${duplicateName}" berhasil digandakan!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Quick Price Change (Ubah Tarif Instan)
  const handleQuickPriceChange = (car: CarType) => {
    const input = prompt(
      `Ubah tarif sewa harian untuk ${car.name}:\n(Tarif saat ini: ${formatCurrency(car.pricePerDay)})`,
      car.pricePerDay.toString()
    );
    if (input !== null) {
      const newPrice = parseInt(input.replace(/\D/g, ''));
      if (!isNaN(newPrice) && newPrice > 0) {
        const updated = cars.map(c => c.id === car.id ? { ...c, pricePerDay: newPrice } : c);
        updateAndSaveCars(updated);
        setToastMessage(`Tarif ${car.name} berhasil diubah menjadi ${formatCurrency(newPrice)}/hari!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert("Nominal harga tidak valid. Masukkan angka positif.");
      }
    }
  };

  // Quick Set All Units Status
  const handleQuickSetAllAvailability = (available: boolean) => {
    const label = available ? "Tersedia (Siap Sewa)" : "Sedang Tersewa";
    if (confirm(`Ubah status seluruh ${cars.length} unit armada menjadi "${label}"?`)) {
      const updated = cars.map(c => ({ ...c, available }));
      updateAndSaveCars(updated);
      setToastMessage(`Semua ${cars.length} unit mobil kini berstatus "${label}"!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Category Management Handlers
  const handleAddCategory = (catName: string): boolean => {
    const trimmed = catName.trim();
    if (!trimmed) {
      alert("Nama kategori tidak boleh kosong!");
      return false;
    }
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("Kategori ini sudah terdaftar!");
      return false;
    }
    const updated = [...categories, trimmed];
    updateAndSaveCategories(updated);
    setToastMessage(`Kategori "${trimmed}" berhasil ditambahkan!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    return true;
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    const trimmedNew = newName.trim();
    if (!trimmedNew) {
      alert("Nama kategori baru tidak boleh kosong!");
      return;
    }
    if (trimmedNew.toLowerCase() === oldName.toLowerCase()) {
      setEditingCatOldName(null);
      return;
    }
    if (categories.some(c => c.toLowerCase() === trimmedNew.toLowerCase())) {
      alert("Kategori dengan nama tersebut sudah ada!");
      return;
    }

    // 1. Update categories list
    const updatedCats = categories.map(c => c === oldName ? trimmedNew : c);
    updateAndSaveCategories(updatedCats);

    // 2. Cascade rename to all cars in this category
    const updatedCars = cars.map(car => car.category === oldName ? { ...car, category: trimmedNew } : car);
    updateAndSaveCars(updatedCars);

    // 3. Update active filter if needed
    if (fleetCategoryFilter === oldName) {
      setFleetCategoryFilter(trimmedNew);
    }

    setEditingCatOldName(null);
    setToastMessage(`Kategori "${oldName}" diubah menjadi "${trimmedNew}" (data armada otomatis diperbarui)!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleDeleteCategory = (catName: string) => {
    if (categories.length <= 1) {
      alert("Minimal harus ada 1 kategori aktif dalam sistem.");
      return;
    }

    const affectedCars = cars.filter(c => c.category === catName);
    if (affectedCars.length > 0) {
      const fallbackCat = categories.find(c => c !== catName) || "MPV Keluarga";
      if (!confirm(`Terdapat ${affectedCars.length} mobil yang terdaftar pada kategori "${catName}". Jika dihapus, unit-unit ini akan otomatis dipindahkan ke kategori "${fallbackCat}". Lanjutkan penghapusan?`)) {
        return;
      }
      const updatedCars = cars.map(car => car.category === catName ? { ...car, category: fallbackCat } : car);
      updateAndSaveCars(updatedCars);
    } else {
      if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${catName}"?`)) {
        return;
      }
    }

    const updatedCats = categories.filter(c => c !== catName);
    updateAndSaveCategories(updatedCats);

    if (fleetCategoryFilter === catName) {
      setFleetCategoryFilter("All");
    }

    setToastMessage(`Kategori "${catName}" berhasil dihapus.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle Form Submission (Add or Edit)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto default luxury fallback image links based on category
    let finalImage = carImage.trim();
    if (!finalImage) {
      if (carCategory === "MPV Keluarga") {
        finalImage = "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800";
      } else if (carCategory === "City Car") {
        finalImage = "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800";
      } else {
        finalImage = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800";
      }
    }

    if (editingCar) {
      // Update existing car
      const updatedCars = cars.map((c) => {
        if (c.id === editingCar.id) {
          return {
            ...c,
            name: carName,
            category: carCategory,
            seats: carSeats,
            transmission: carTransmission,
            fuelType: carFuelType,
            pricePerDay: carPrice,
            image: finalImage,
          };
        }
        return c;
      });
      updateAndSaveCars(updatedCars);
      setToastMessage(`Data armada "${carName}" berhasil diperbarui!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      // Add new car
      const newId = carName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
      const newCar: CarType = {
        id: newId,
        name: carName,
        category: carCategory,
        rating: 5.0,
        reviewsCount: 0,
        seats: carSeats,
        transmission: carTransmission,
        fuelType: carFuelType,
        baggage: carCategory === "City Car" ? 2 : carCategory === "Minibus Wisata" ? 5 : 3,
        pricePerDay: carPrice,
        driverPricePerDay: 200000,
        fuelPricePerDay: 150000,
        insurancePricePerDay: 50000,
        available: true,
        image: finalImage,
        gallery: [finalImage]
      };
      updateAndSaveCars([newCar, ...cars]);
      setToastMessage(`Mobil baru "${carName}" berhasil ditambahkan ke armada!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }

    setIsFormOpen(false);
  };

  // Fleet Statistics & Filter Logic
  const totalFleetCount = cars.length;
  const availableFleetCount = cars.filter(c => c.available).length;
  const rentedFleetCount = cars.filter(c => !c.available).length;
  const fleetUtilizationPct = totalFleetCount > 0 ? Math.round((rentedFleetCount / totalFleetCount) * 100) : 0;
  const avgFleetPrice = totalFleetCount > 0 ? Math.round(cars.reduce((sum, c) => sum + c.pricePerDay, 0) / totalFleetCount) : 0;

  // Filtered and Sorted Cars
  const filteredCars = cars
    .filter((car) => {
      if (fleetSearchQuery.trim()) {
        const q = fleetSearchQuery.toLowerCase();
        const matchName = car.name.toLowerCase().includes(q);
        const matchCat = car.category.toLowerCase().includes(q);
        const matchFuel = car.fuelType.toLowerCase().includes(q);
        const matchTrans = car.transmission.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchFuel && !matchTrans) return false;
      }
      if (fleetCategoryFilter !== "All" && car.category !== fleetCategoryFilter) {
        return false;
      }
      if (fleetStatusFilter === "available" && !car.available) return false;
      if (fleetStatusFilter === "rented" && car.available) return false;

      return true;
    })
    .sort((a, b) => {
      if (fleetSortBy === "name-asc") return a.name.localeCompare(b.name);
      if (fleetSortBy === "name-desc") return b.name.localeCompare(a.name);
      if (fleetSortBy === "price-asc") return a.pricePerDay - b.pricePerDay;
      if (fleetSortBy === "price-desc") return b.pricePerDay - a.pricePerDay;
      if (fleetSortBy === "seats-desc") return b.seats - a.seats;
      return 0;
    });

  const navGroups = [
    {
      group: "Operasional Utama",
      items: [
        { id: "analytics", label: "Ringkasan & Analitik", icon: <LayoutDashboard className="w-4 h-4" /> },
        { 
          id: "bookings", 
          label: "Kelola Booking", 
          icon: <Calendar className="w-4 h-4" />,
          badge: bookings.filter(b => b.status === "Pending").length > 0 
            ? `${bookings.filter(b => b.status === "Pending").length} Baru` 
            : null,
          badgeColor: "amber"
        },
        { 
          id: "fleet", 
          label: "Kelola Armada", 
          icon: <Car className="w-4 h-4" />,
          badge: `${cars.length} Unit`,
          badgeColor: "slate"
        },
        { 
          id: "drivers", 
          label: "Kelola Driver", 
          icon: <UserCheck className="w-4 h-4" />,
          badge: drivers.filter(d => d.status === "Standby").length > 0 
            ? `${drivers.filter(d => d.status === "Standby").length} Siap` 
            : null,
          badgeColor: "emerald"
        },
      ]
    },
    {
      group: "Armada & Keuangan",
      items: [
        { 
          id: "maintenance", 
          label: "Servis & Pajak STNK", 
          icon: <Wrench className="w-4 h-4" />,
          badge: (urgentTaxCount + urgentServiceCount) > 0 ? `${urgentTaxCount + urgentServiceCount} Perlu` : null,
          badgeColor: "rose"
        },
        { id: "finance", label: "Buku Kas & Keuangan", icon: <Wallet className="w-4 h-4" /> },
      ]
    },
    {
      group: "Konten Website",
      items: [
        { id: "testimonials", label: "Kelola Ulasan", icon: <MessageSquare className="w-4 h-4" /> },
        { id: "faqs", label: "Tanya Jawab FAQ", icon: <HelpCircle className="w-4 h-4" /> },
        { id: "blog", label: "Jurnal & Artikel", icon: <FileText className="w-4 h-4" /> },
        { id: "appearance", label: "Tampilan & Banner", icon: <Image className="w-4 h-4" /> },
      ]
    },
    {
      group: "Sistem",
      items: [
        { id: "settings", label: "Pengaturan Rental", icon: <Sliders className="w-4 h-4" /> },
      ]
    }
  ];

  const allNavItems = navGroups.flatMap(g => g.items);
  const navTabs = allNavItems;
  const currentActiveTabObj = allNavItems.find(t => t.id === activeTab) || allNavItems[0];
  const currentGroupObj = navGroups.find(g => g.items.some(t => t.id === activeTab)) || navGroups[0];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col md:flex-row h-screen text-slate-600 overflow-hidden font-sans">
      
      {/* MOBILE TOP HEADER BAR (Visible only on mobile/tablet screens) */}
      <header className="md:hidden bg-white text-slate-800 px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 z-20 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 rounded-xl transition-all focus:outline-none cursor-pointer border border-slate-200"
            aria-label="Buka Menu Admin"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-accent">{currentActiveTabObj.icon}</span>
            <span className="font-display font-bold text-xs uppercase tracking-wider text-slate-800 truncate max-w-[170px]">
              {currentActiveTabObj.label}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mobile Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifCenterOpen(!isNotifCenterOpen)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative cursor-pointer transition-colors"
              title="Notifikasi Booking"
            >
              <Bell className="w-4 h-4" />
              {bookings.filter(b => b.status === "Pending").length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {bookings.filter(b => b.status === "Pending").length > 9 ? "9+" : bookings.filter(b => b.status === "Pending").length}
                </span>
              )}
            </button>
          </div>

          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping mr-1" title="Online" />
          <button
            onClick={onClose}
            className="px-2.5 py-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg text-[10px] font-display uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer transition-all border border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY & MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white border-r border-slate-200 z-50 flex flex-col justify-between p-5 md:hidden shadow-2xl overflow-y-auto text-slate-700"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-display font-black text-base shadow-sm shadow-amber-500/20">
                      RD
                    </div>
                    <div className="text-left">
                      <span className="font-display font-black text-xs text-slate-900 uppercase tracking-wider block">Royal Drive</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mr-1 inline-block" />
                        Live Console
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    aria-label="Tutup Menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-4">
                  {navGroups.map((grp) => (
                    <div key={grp.group} className="space-y-1">
                      <div className="px-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        {grp.group}
                      </div>
                      <div className="space-y-0.5">
                        {grp.items.map((tab) => {
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => {
                                setActiveTab(tab.id as any);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-display text-xs uppercase tracking-wider transition-all focus:outline-none cursor-pointer text-left ${
                                isActive
                                  ? "bg-accent text-white font-bold shadow-md shadow-accent/20"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              }`}
                            >
                              <div className="flex items-center space-x-3 min-w-0">
                                <span className={isActive ? "text-white" : "text-slate-500"}>{tab.icon}</span>
                                <span className="truncate">{tab.label}</span>
                              </div>
                              {tab.badge ? (
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ml-2 shrink-0 ${
                                  isActive
                                    ? "bg-white/25 text-white font-extrabold"
                                    : tab.badgeColor === "amber"
                                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                                      : tab.badgeColor === "rose"
                                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                                        : tab.badgeColor === "emerald"
                                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                          : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}>
                                  {tab.badge}
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-200 mt-6">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-rose-600 hover:text-white hover:bg-rose-600 rounded-xl font-display text-xs uppercase tracking-wider transition-all focus:outline-none cursor-pointer font-bold border border-rose-200 hover:border-rose-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit Console</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR (Visible on md and above) */}
      <aside className="hidden md:flex md:w-68 bg-white border-r border-slate-200 flex-col justify-between p-5 shrink-0 z-10 overflow-y-auto text-slate-700 select-none shadow-xs">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center space-x-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-display font-black text-base shadow-sm shadow-amber-500/20 shrink-0">
              RD
            </div>
            <div className="text-left min-w-0">
              <span className="font-display font-black text-xs text-slate-900 uppercase tracking-wider block truncate">
                ROYAL DRIVE
              </span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shrink-0" />
                <span className="text-[10px] text-emerald-600 font-bold truncate">Live HQ Console</span>
              </div>
            </div>
          </div>

          {/* Grouped Navigation */}
          <nav className="space-y-4">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {group.group}
                </div>
                <div className="space-y-1">
                  {group.items.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-display text-xs uppercase tracking-wider transition-all focus:outline-none cursor-pointer text-left ${
                          isActive
                            ? "bg-accent text-white font-bold shadow-md shadow-accent/20"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className={isActive ? "text-white" : "text-slate-500"}>
                            {tab.icon}
                          </span>
                          <span className="truncate">{tab.label}</span>
                        </div>
                        {tab.badge ? (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ml-1.5 shrink-0 ${
                            isActive
                              ? "bg-white/25 text-white font-extrabold shadow-xs"
                              : tab.badgeColor === "amber"
                                ? "bg-amber-100 text-amber-800 border border-amber-200 font-bold"
                                : tab.badgeColor === "rose"
                                  ? "bg-rose-100 text-rose-800 border border-rose-200 font-bold"
                                  : tab.badgeColor === "emerald"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}>
                            {tab.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: User Profile & Exit */}
        <div className="pt-4 border-t border-slate-200 mt-6 space-y-3">
          <div className="flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-display font-bold text-xs text-slate-900 block truncate">Administrator</span>
              <span className="text-[10px] text-slate-500 block truncate">Super Admin Console</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-display text-xs uppercase tracking-wider transition-all border border-rose-200 cursor-pointer font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Console</span>
          </button>
        </div>
      </aside>

      {/* ADMIN CONTENT PANEL */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto z-0 bg-slate-50/50 relative text-left">
        
        {/* TOPBAR: Breadcrumb & Real-time Notification Control */}
        <div className="sticky -top-6 -mx-6 md:-top-10 md:-mx-10 px-6 md:px-10 py-4 mb-8 bg-white/95 backdrop-blur-md border-b border-slate-200/90 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shrink-0 shadow-xs">
              {currentActiveTabObj.icon}
            </div>
            <div>
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Console</span>
                <span>/</span>
                <span className="text-slate-600">{currentGroupObj.group}</span>
                <span>/</span>
                <span className="text-accent font-black">{currentActiveTabObj.label}</span>
              </div>
              <h1 className="font-display font-black text-lg md:text-xl text-slate-900 leading-tight">
                {currentActiveTabObj.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Live Sync Status Pill */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>Real-time Sync</span>
            </div>

            {/* Audio Bell Mute/Unmute */}
            <button
              onClick={toggleSound}
              type="button"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                soundEnabled 
                  ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100" 
                  : "bg-slate-100 border-slate-300 text-slate-400 hover:bg-slate-200"
              }`}
              title={soundEnabled ? "Audio Notifikasi Aktif" : "Audio Notifikasi Bisu"}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span className="text-[11px]">{soundEnabled ? "Audio Bel" : "Muted"}</span>
            </button>

            {/* Desktop Notification Request */}
            {desktopNotifState !== "granted" && (
              <button
                onClick={handleRequestDesktopPush}
                type="button"
                className="hidden xl:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all cursor-pointer"
                title="Aktifkan Notifikasi Desktop Browser"
              >
                <Bell className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px]">Push Notif</span>
              </button>
            )}

            {/* Notification Bell Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotifCenterOpen(!isNotifCenterOpen)}
                type="button"
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 relative transition-all cursor-pointer flex items-center space-x-2 shadow-xs"
                title="Pusat Notifikasi Pesanan"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold">Pesanan Masuk</span>
                {bookings.filter(b => b.status === "Pending").length > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                    {bookings.filter(b => b.status === "Pending").length}
                  </span>
                )}
              </button>

              {/* Notification Center Dropdown */}
              <AnimatePresence>
                {isNotifCenterOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsNotifCenterOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-4 h-4 text-accent" />
                          <span className="font-display font-bold text-xs uppercase tracking-wider">Antrean Pesanan Masuk</span>
                        </div>
                        <span className="text-[10px] bg-accent/20 text-accent border border-accent/30 font-bold px-2.5 py-0.5 rounded-full">
                          {bookings.filter(b => b.status === "Pending").length} Pending
                        </span>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {bookings.filter(b => b.status === "Pending").length === 0 ? (
                          <div className="p-6 text-center text-slate-400">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                            <p className="text-xs font-semibold text-slate-600">Semua pesanan sudah diverifikasi!</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada antrean pesanan pending baru saat ini.</p>
                          </div>
                        ) : (
                          bookings.filter(b => b.status === "Pending").map(b => (
                            <div 
                              key={b.id} 
                              onClick={() => {
                                setSelectedVerificationBooking(b);
                                setIsNotifCenterOpen(false);
                              }}
                              className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                <Car className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800 truncate">{b.client}</span>
                                  <span className="text-[10px] font-mono text-slate-400">{b.id}</span>
                                </div>
                                <p className="text-[11px] text-slate-600 truncate">{b.car} &bull; {b.rentalType}</p>
                                <div className="flex items-center justify-between mt-1 text-[10px]">
                                  <span className="text-accent font-bold">
                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(b.totalPrice)}
                                  </span>
                                  <span className="text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[9px]">
                                    Verifikasi &rarr;
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("bookings");
                            setIsNotifCenterOpen(false);
                          }}
                          className="text-accent hover:text-accent-hover font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Buka Kelola Booking &rarr;
                        </button>
                        <button
                          type="button"
                          onClick={handleTestSound}
                          className="text-slate-500 hover:text-slate-800 text-[10px] font-medium transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <Volume2 className="w-3 h-3 text-slate-400" />
                          <span>Tes Suara</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* TAB 1: Analytics & Reports */}
        {activeTab === "analytics" && (
          <div className="space-y-8 text-left">
            {/* Header & Quick Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent font-bold block">Executive Performance Overview</span>
                <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900">Ringkasan & Analitik Operasional</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Pantau performa bisnis sewa mobil, perputaran armada, utilisasi, dan arus kas masuk secara realtime.
                </p>
              </div>

              <div className="flex items-center space-x-3 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("bookings")}
                  className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl shadow-md shadow-accent/20 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Buka Kelola Booking</span>
                </button>
              </div>
            </div>

            {/* 4 Unified KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Revenue */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Pendapatan Masuk</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="font-display font-black text-2xl text-emerald-700 block" suppressHydrationWarning>
                    {formatCurrency(dynamicTotalRevenue)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1 mt-1">
                    <TrendingUp className="w-3 h-3 inline" />
                    <span>Akumulasi DP 30% & Pelunasan</span>
                  </span>
                </div>
              </div>

              {/* Card 2: Active Bookings */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Booking Aktif</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="font-display font-black text-2xl text-slate-900 block">
                    {dynamicActiveBookingsCount} <span className="text-sm font-sans font-normal text-slate-500">Pesanan</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Pending verifikasi & unit di lapangan
                  </span>
                </div>
              </div>

              {/* Card 3: Fleet Utilization */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Utilisasi Armada</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="font-display font-black text-2xl text-amber-700 block">
                    {dynamicUtilizationRate}%
                  </span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${dynamicUtilizationRate}%` }} 
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1.5">
                    {dynamicRentedCarsCount} dari {cars.length} unit sedang tersewa
                  </span>
                </div>
              </div>

              {/* Card 4: Top Car */}
              <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Armada Terpopuler</span>
                  <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center">
                    <Car className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="font-display font-black text-lg text-slate-900 block truncate" title={dynamicPopularCar}>
                    {dynamicPopularCar}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Paling sering disewa pelanggan
                  </span>
                </div>
              </div>
            </div>

            {/* 2-Column Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (8 cols): Revenue Chart & Recent Bookings Preview */}
              <div className="lg:col-span-8 space-y-6">
                {/* Revenue Chart Card */}
                <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-900">Tren Pendapatan Rental Showroom</h3>
                      <p className="text-[11px] text-slate-500">Semester Pertama 2026 (dalam Juta Rupiah)</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Realisasi Kas</span>
                      </span>
                    </div>
                  </div>

                  {/* Line chart simulation using SVG */}
                  <div className="h-56 relative w-full flex items-center justify-center">
                    <svg className="w-full h-full text-slate-200" viewBox="0 0 600 200" fill="none">
                      <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
                      <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
                      <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
                      
                      <text x="15" y="195" fill="rgba(0,0,0,0.4)" fontSize="9" fontWeight="600">JAN</text>
                      <text x="120" y="195" fill="rgba(0,0,0,0.4)" fontSize="9" fontWeight="600">FEB</text>
                      <text x="230" y="195" fill="rgba(0,0,0,0.4)" fontSize="9" fontWeight="600">MAR</text>
                      <text x="340" y="195" fill="rgba(0,0,0,0.4)" fontSize="9" fontWeight="600">APR</text>
                      <text x="450" y="195" fill="rgba(0,0,0,0.4)" fontSize="9" fontWeight="600">MEI</text>
                      <text x="555" y="195" fill="rgba(0,0,0,0.4)" fontSize="9" fontWeight="600">JUN</text>

                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C5A059" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#C5A059" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 20 160 Q 120 115 230 130 T 450 70 T 565 45 L 565 180 L 20 180 Z"
                        fill="url(#chartGrad)"
                      />

                      <path
                        d="M 20 160 Q 120 115 230 130 T 450 70 T 565 45"
                        stroke="#C5A059"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <circle cx="20" cy="160" r="4.5" fill="#FFFFFF" stroke="#C5A059" strokeWidth="2.5" />
                      <circle cx="230" cy="130" r="4.5" fill="#FFFFFF" stroke="#C5A059" strokeWidth="2.5" />
                      <circle cx="450" cy="70" r="4.5" fill="#FFFFFF" stroke="#C5A059" strokeWidth="2.5" />
                      <circle cx="565" cy="45" r="4.5" fill="#FFFFFF" stroke="#C5A059" strokeWidth="2.5" />
                    </svg>
                  </div>
                </div>

                {/* 5 Recent Bookings Table Preview */}
                <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-900">Aktivitas Reservasi Terkini</h3>
                      <p className="text-[11px] text-slate-500">5 transaksi pemesanan armada terbaru</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("bookings")}
                      className="text-accent hover:text-accent-hover font-bold text-xs transition-colors cursor-pointer"
                    >
                      Buka Kelola Booking &rarr;
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-y border-slate-100 font-display uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">ID & Pelanggan</th>
                          <th className="py-2.5 px-3">Armada</th>
                          <th className="py-2.5 px-3">Total Biaya</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-900 block truncate">{b.client}</span>
                              <span className="text-[10px] font-mono text-slate-400">{b.id}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-slate-800 block truncate">{b.car}</span>
                              <span className="text-[10px] text-slate-500">{b.rentalType}</span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-800">
                              {formatCurrency(b.totalPrice)}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                b.status === "Pending"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : b.status === "Active"
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : b.status === "Completed"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : "bg-slate-100 text-slate-600"
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedVerificationBooking(b)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Quick Operations & Alert Panel */}
              <div className="lg:col-span-4 space-y-4">
                {/* Panel Header */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm space-y-1">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span className="font-display font-bold text-xs uppercase tracking-wider">Pusat Kendali Operasi</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Peringatan prioritas yang membutuhkan perhatian admin hari ini.
                  </p>
                </div>

                {/* Alert 1: Pending DP Bookings */}
                {bookings.filter(b => b.status === "Pending").length > 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                        <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                        <span>{bookings.filter(b => b.status === "Pending").length} Booking Menunggu Verifikasi DP</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Terdapat pesanan masuk baru yang belum diverifikasi berkas identitas & bukti transfer DP 30%.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("bookings")}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                    >
                      Buka Antrean Pending &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-xs text-emerald-800 font-semibold">Semua antrean booking terverifikasi rapi.</span>
                  </div>
                )}

                {/* Alert 2: Returning Today / Overtime Monitoring */}
                {todayReturningBookings.length > 0 ? (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs text-orange-900">Unit Kembali Hari Ini</span>
                      <span className="text-[10px] bg-orange-200 text-orange-900 font-extrabold px-2 py-0.5 rounded-full">
                        {todayReturningBookings.length} Armada
                      </span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {todayReturningBookings.slice(0, 3).map(b => (
                        <div key={b.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-orange-200">
                          <span className="font-bold text-slate-800 truncate max-w-[120px]">{b.car}</span>
                          <span className="font-mono text-[10px] text-slate-500">{b.carPlate}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("bookings")}
                      className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center mt-2"
                    >
                      Pantau Jadwal Serah Terima &rarr;
                    </button>
                  </div>
                ) : null}

                {/* Alert 3: Urgent Tax / STNK */}
                {urgentTaxCount > 0 && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-xs text-rose-900">Jatuh Tempo Pajak STNK</span>
                      <span className="text-[10px] bg-rose-200 text-rose-900 font-extrabold px-2 py-0.5 rounded-full">
                        {urgentTaxCount} Unit
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-800">
                      Ada armada yang masa berlaku pajak STNK akan habis dalam 30 hari ke depan.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("maintenance")}
                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                    >
                      Lihat Rincian Pajak &rarr;
                    </button>
                  </div>
                )}

                {/* Quick Status: Drivers */}
                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-xs text-slate-800">Status Driver Siap</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                      {drivers.filter(d => d.status === "Standby").length} Standby
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Pengemudi resmi siap ditugaskan melayani pesanan sewa mobil dengan sopir.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("drivers")}
                    className="text-accent hover:text-accent-hover font-bold text-xs transition-colors cursor-pointer block pt-1"
                  >
                    Buka Roster Driver &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}{/* TAB 2: Kelola Armada (User-Friendly Fleet Management) */}
        {activeTab === "fleet" && (
          <div className="space-y-6">
            
            {/* Header Title & Top Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent font-semibold block">
                  Showroom Fleet Management
                </span>
                <h3 className="font-display font-extrabold text-xl md:text-2xl text-slate-800">
                  Kelola & Pantau Armada Showroom
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Kontrol ketersediaan unit, tarif harian, duplikasi unit armada, dan pantau status sewa secara realtime.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-200"
                  title="Kelola daftar kategori mobil (tambah, edit, hapus)"
                >
                  <Tag className="w-3.5 h-3.5 text-accent" />
                  <span>Kelola Kategori ({categories.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSetAllAvailability(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-200"
                  title="Atur semua mobil menjadi siap sewa"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Set Semua Siap</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddForm}
                  className="flex items-center space-x-2 bg-accent hover:bg-accent-hover text-white font-display font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all focus:outline-none cursor-pointer shadow-md shadow-accent/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Mobil Baru</span>
                </button>
              </div>
            </div>

            {/* KPI Summary Metric Cards (At-a-Glance) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-left">
              {/* Total Unit */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Total Armada</span>
                  <Car className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-display font-black text-2xl text-slate-900">{totalFleetCount}</span>
                  <span className="text-xs text-slate-500">Unit Terdaftar</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Armada aktif siap operasi</span>
              </div>

              {/* Siap Sewa (Tersedia) */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-emerald-700 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Siap / Tersedia</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-display font-black text-2xl text-emerald-700">{availableFleetCount}</span>
                  <span className="text-xs text-emerald-600 font-semibold">Unit Siap</span>
                </div>
                <span className="text-[10px] text-emerald-600/90 block mt-1">Bisa langsung dipesan konsumen</span>
              </div>

              {/* Sedang Tersewa / Jalan */}
              <div className="p-4 bg-rose-50/50 border border-rose-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-rose-700 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Sedang Tersewa</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-display font-black text-2xl text-rose-700">{rentedFleetCount}</span>
                  <span className="text-xs text-rose-600 font-semibold">Unit di Lapangan</span>
                </div>
                <span className="text-[10px] text-rose-600/90 block mt-1">Terkunci dalam masa sewa</span>
              </div>

              {/* Utilisasi & Rata-rata Tarif */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Tingkat Utilisasi</span>
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-display font-black text-2xl text-slate-900">{fleetUtilizationPct}%</span>
                  <span className="text-[10px] text-slate-500">Terutilisasi</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${fleetUtilizationPct}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Filter, Search & View Controls Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 text-left">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fleetSearchQuery}
                    onChange={(e) => setFleetSearchQuery(e.target.value)}
                    placeholder="Cari mobil (nama, transmisi AT/MT, bahan bakar, kategori)..."
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-9 py-2.5 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-accent"
                  />
                  {fleetSearchQuery && (
                    <button
                      onClick={() => setFleetSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setFleetViewMode("grid")}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        fleetViewMode === "grid"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="Tampilan Kartu Visual"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Kartu</span>
                    </button>
                    <button
                      onClick={() => setFleetViewMode("table")}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        fleetViewMode === "table"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="Tampilan Tabel Rinci"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Tabel</span>
                    </button>
                    <button
                      onClick={() => setFleetViewMode("schedule")}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        fleetViewMode === "schedule"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      title="Tampilan Kalender Jadwal"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Jadwal 14 Hari</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-Filters: Category, Status, & Sorting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                {/* Category Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: "All", label: "Semua Kategori", count: cars.length },
                    ...categories.map(cat => ({
                      id: cat,
                      label: cat,
                      count: cars.filter(c => c.category === cat).length
                    }))
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFleetCategoryFilter(cat.id)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        fleetCategoryFilter === cat.id
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}

                  {/* Quick Add / Manage Category pill */}
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer bg-accent/10 hover:bg-accent/20 text-accent flex items-center space-x-1 shrink-0"
                    title="Buka Manajemen Kategori"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Kategori</span>
                  </button>
                </div>

                {/* Status & Sort Controls */}
                <div className="flex items-center space-x-2 shrink-0">
                  {/* Status filter */}
                  <select
                    value={fleetStatusFilter}
                    onChange={(e) => setFleetStatusFilter(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-xl font-medium focus:outline-none focus:border-accent"
                  >
                    <option value="all">Semua Status</option>
                    <option value="available">Hanya Siap Sewa</option>
                    <option value="rented">Sedang Tersewa</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={fleetSortBy}
                    onChange={(e) => setFleetSortBy(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-xl font-medium focus:outline-none focus:border-accent"
                  >
                    <option value="name-asc">Nama (A-Z)</option>
                    <option value="name-desc">Nama (Z-A)</option>
                    <option value="price-asc">Tarif Termurah</option>
                    <option value="price-desc">Tarif Tertinggi</option>
                    <option value="seats-desc">Kursi Terbanyak</option>
                  </select>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            {filteredCars.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Car className="w-6 h-6" />
                </div>
                <h4 className="font-display font-bold text-slate-800 text-sm">Tidak Ada Mobil yang Cocok</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tidak ditemukan armada dengan kata kunci atau filter terpilih. Coba ubah pencarian Anda.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFleetSearchQuery("");
                    setFleetCategoryFilter("All");
                    setFleetStatusFilter("all");
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Reset Pencarian & Filter
                </button>
              </div>
            ) : fleetViewMode === "grid" ? (
              /* VIEW 1: KARTU VISUAL GRID (User-Friendly Cards) */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 text-left">
                {filteredCars.map((car) => {
                  const activeBookingForCar = bookings.find(
                    b => b.car.toLowerCase() === car.name.toLowerCase() && b.status === "Active"
                  );

                  return (
                    <div
                      key={car.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Car Image & Badges */}
                        <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                          <img
                            src={car.image}
                            alt={car.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                          {/* Category Badge */}
                          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-display font-bold uppercase tracking-wider text-slate-800 shadow-sm">
                            {car.category}
                          </span>

                          {/* Instant 1-Click Availability Toggle Badge */}
                          <button
                            type="button"
                            onClick={() => handleToggleCarAvailability(car.id)}
                            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-display font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                              car.available
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-rose-500 hover:bg-rose-600 text-white"
                            }`}
                            title="Klik untuk ubah status ketersediaan"
                          >
                            <span className={`w-2 h-2 rounded-full bg-white ${car.available ? "animate-ping" : ""}`} />
                            <span>{car.available ? "Siap Sewa" : "Tersewa"}</span>
                          </button>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-display font-bold text-base text-slate-900 leading-snug">
                                {car.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {car.id}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Tarif Lepas Kunci</span>
                              <span className="font-display font-black text-sm text-accent">
                                {formatCurrency(car.pricePerDay)}
                              </span>
                              <span className="text-[10px] text-slate-400 block">/hari</span>
                            </div>
                          </div>

                          {/* Quick Specs Badges */}
                          <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] text-slate-600 font-medium">
                            <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-center truncate">
                              👥 {car.seats} Kursi
                            </span>
                            <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-center truncate">
                              ⚙️ {car.transmission === "Dual-Clutch" ? "DCT" : car.transmission === "Automatic" ? "Matic (AT)" : "Manual (MT)"}
                            </span>
                            <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-center truncate">
                              ⛽ {car.fuelType.split(" ")[0]}
                            </span>
                          </div>

                          {/* Active Rental Alert banner if currently on road */}
                          {activeBookingForCar && (
                            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-[11px] text-red-700">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                              <span className="truncate">
                                Disewa: <b>{activeBookingForCar.client}</b> (s/d {activeBookingForCar.endDate})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Toolbar */}
                      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                        <div className="flex items-center space-x-1.5">
                          {/* Quick Price Edit */}
                          <button
                            type="button"
                            onClick={() => handleQuickPriceChange(car)}
                            className="p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1"
                            title="Ubah tarif sewa harian cepat"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px] hidden sm:inline">Tarif</span>
                          </button>

                          {/* Duplicate Unit */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateCar(car)}
                            className="p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1"
                            title="Gandakan unit armada kembar"
                          >
                            <Copy className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[10px] hidden sm:inline">Duplikat</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {/* Full Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(car)}
                            className="px-3 py-1.5 bg-white hover:bg-accent hover:text-white text-slate-700 border border-slate-200 hover:border-accent rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1"
                            title="Edit lengkap data mobil"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCar(car.id)}
                            className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition-all cursor-pointer"
                            title="Hapus mobil dari armada"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : fleetViewMode === "table" ? (
              /* VIEW 2: TABEL RINCI (High-Density Professional Table) */
              <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs text-left">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="border-b border-slate-200 font-display text-[9px] uppercase tracking-widest text-slate-500 bg-slate-50">
                      <th className="py-3.5 px-5">Armada Kendaraan</th>
                      <th className="py-3.5 px-4">Kategori</th>
                      <th className="py-3.5 px-4">Spesifikasi Unit</th>
                      <th className="py-3.5 px-4">Tarif Sewa</th>
                      <th className="py-3.5 px-4">Ketersediaan</th>
                      <th className="py-3.5 px-5 text-right">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                    {filteredCars.map((car) => (
                      <tr key={car.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 flex items-center space-x-3">
                          <div className="w-16 h-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <img src={car.image} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div>
                            <span className="font-display font-bold text-slate-900 block">{car.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {car.id}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                            {car.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-slate-500 space-y-0.5">
                          <div>👥 {car.seats} Kursi &bull; ⚙️ {car.transmission}</div>
                          <div>⛽ {car.fuelType}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-display font-bold text-slate-900 text-xs">
                              {formatCurrency(car.pricePerDay)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickPriceChange(car)}
                              className="p-1 text-slate-400 hover:text-accent hover:bg-slate-100 rounded cursor-pointer"
                              title="Ubah tarif cepat"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 block">/hari</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleCarAvailability(car.id)}
                            className={`px-3 py-1 rounded-full font-display text-[9px] uppercase tracking-widest font-bold border transition-all cursor-pointer flex items-center space-x-1 ${
                              car.available
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                            }`}
                            title="Klik untuk ubah status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${car.available ? "bg-emerald-500" : "bg-rose-500"}`} />
                            <span>{car.available ? "Tersedia" : "Tersewa"}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-5 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => handleDuplicateCar(car)}
                            className="p-2 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer bg-white"
                            title="Gandakan Unit Armada"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(car)}
                            className="p-2 border border-slate-200 hover:border-accent hover:text-accent hover:bg-slate-50 rounded-lg transition-colors cursor-pointer bg-white"
                            title="Edit Lengkap"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCar(car.id)}
                            className="p-2 border border-rose-200 hover:border-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors text-rose-600 cursor-pointer bg-white"
                            title="Hapus Mobil"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* VIEW 3: JADWAL SEWA 14 HARI (Interactive Timeline) */
              <div className="bg-white border border-slate-200 rounded-2xl p-5 overflow-x-auto shadow-xs text-left">
                <div className="min-w-[950px] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">Kalender Ketersediaan Unit (14 Hari ke Depan)</span>
                      <span className="text-[11px] text-slate-500">Pantau mobil yang sedang jalan untuk mencegah jadwal sewa ganda / bentrok</span>
                    </div>
                    <div className="flex items-center space-x-4 text-[10px] font-bold">
                      <span className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Unit Kosong / Siap</span>
                      </span>
                      <span className="flex items-center space-x-1.5 text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Sedang Tersewa / Jalan</span>
                      </span>
                    </div>
                  </div>

                  {/* Schedule Table Grid */}
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="p-3 text-slate-700 w-52 text-left font-display font-bold uppercase tracking-wider text-[10px]">
                          Armada Kendaraan
                        </th>
                        {Array.from({ length: 14 }).map((_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() + i);
                          const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
                          const isToday = i === 0;
                          return (
                            <th key={i} className={`p-2 text-center border-l border-slate-200 ${isToday ? "bg-red-50/80 text-red-600 font-bold" : "text-slate-600"}`}>
                              <span className="block text-[9px] uppercase tracking-wider">{dayNames[d.getDay()]}</span>
                              <span className="block font-display font-black text-xs mt-0.5">{d.getDate()}</span>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCars.map((car) => (
                        <tr key={car.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-semibold text-slate-900">
                            <span className="block truncate max-w-[190px] font-display">{car.name}</span>
                            <span className="text-[10px] text-slate-400 block font-normal">{car.category}</span>
                          </td>
                          {Array.from({ length: 14 }).map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() + i);
                            const dateStr = d.toISOString().split("T")[0];
                            const activeBooking = bookings.find(
                              b => b.car === car.name && b.startDate <= dateStr && b.endDate >= dateStr && b.status !== "Completed"
                            );
                            const isToday = i === 0;
                            return (
                              <td key={i} className={`p-1 text-center border-l border-slate-100 ${isToday ? "bg-red-50/15" : ""}`}>
                                {activeBooking ? (
                                  <div
                                    title={`Disewa oleh: ${activeBooking.client}\nNo. Booking: ${activeBooking.id}\nTanggal: ${activeBooking.startDate} s/d ${activeBooking.endDate}`}
                                    className="bg-red-100 hover:bg-red-200 text-red-800 text-[9px] font-mono font-bold py-1.5 px-1 rounded-md truncate cursor-help border border-red-200 shadow-2xs transition-colors"
                                  >
                                    {activeBooking.id}
                                  </div>
                                ) : (
                                  <div className="bg-emerald-50 text-emerald-700 text-[9px] font-bold py-1.5 px-1 rounded-md border border-emerald-100">
                                    Siap
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: Kelola Booking & Operasional Lapangan */}
        {activeTab === "bookings" && (
          <div className="space-y-6 text-left">
            {/* Header & Export */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent font-bold block">
                  Reservations & Legal Compliance
                </span>
                <h3 className="font-display font-extrabold text-xl md:text-2xl text-slate-900">
                  Kelola Booking & Legalitas Transaksi
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Verifikasi berkas identitas penyewa, bukti transfer DP 30%, pantau masa sewa, dan konfirmasi unit keluar/masuk.
                </p>
              </div>

              <div className="flex items-center space-x-2.5 self-start sm:self-auto">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                  title="Unduh Rekap Spreadsheet CSV"
                >
                  <Download className="w-3.5 h-3.5 text-accent" />
                  <span>Export CSV / Excel</span>
                </button>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  {bookings.length} Total Reservasi
                </span>
              </div>
            </div>

            {/* 4 KPI Summary Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Card 1: Total Bookings */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Total Reservasi</span>
                  <Calendar className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-display font-black text-2xl text-slate-900">{bookings.length}</span>
                  <span className="text-xs text-slate-500 font-medium">Transaksi</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Keseluruhan data booking masuk</span>
              </div>

              {/* Card 2: Pending Verifikasi */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-amber-700 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Perlu Verifikasi</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-display font-black text-2xl text-amber-800">
                    {bookings.filter(b => b.status === "Pending").length}
                  </span>
                  <span className="text-xs text-amber-700 font-semibold">Pesanan Baru</span>
                </div>
                <span className="text-[10px] text-amber-600 block mt-1">Menunggu cek DP & identitas</span>
              </div>

              {/* Card 3: Active in Progress */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-blue-700 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Di Lapangan</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-display font-black text-2xl text-blue-800">
                    {bookings.filter(b => b.status === "Active").length}
                  </span>
                  <span className="text-xs text-blue-700 font-semibold">Sedang Jalan</span>
                </div>
                <span className="text-[10px] text-blue-600 block mt-1">Armada dalam masa sewa aktif</span>
              </div>

              {/* Card 4: Completed */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between text-emerald-700 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Selesai Kembali</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-display font-black text-2xl text-emerald-800">
                    {bookings.filter(b => b.status === "Completed").length}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold">Tuntas</span>
                </div>
                <span className="text-[10px] text-emerald-600 block mt-1">Unit telah kembali ke pool</span>
              </div>
            </div>

            {/* Filter Status Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-1 w-full sm:w-auto overflow-x-auto">
                {(["All", "Pending", "Active", "Completed"] as const).map((st) => {
                  const count = st === "All" ? bookings.length : bookings.filter(b => b.status === st).length;
                  const label = st === "All" ? "Semua" : st === "Pending" ? "Menunggu" : st === "Active" ? "Sedang Berjalan" : "Selesai";
                  return (
                    <button
                      key={st}
                      onClick={() => setBookingFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        bookingFilterStatus === st
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                      }`}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari ID, penyewa, atau mobil..."
                  value={bookingSearchQuery}
                  onChange={(e) => setBookingSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

                        {/* Widget Pengembalian Hari Ini & Overtime Monitoring */}
            {todayReturningBookings.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 shadow-xs text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span className="font-display font-bold text-xs uppercase tracking-wider text-amber-900">
                      Jadwal Pengembalian Unit Hari Ini ({todayReturningBookings.length} Armada)
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-medium">
                    Pantau serah terima unit tepat waktu & hindari keterlambatan / overtime
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {todayReturningBookings.map((b) => (
                    <div key={b.id} className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5 truncate">
                          <strong className="text-xs text-slate-900 truncate">{b.car}</strong>
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 shrink-0">{b.carPlate}</span>
                        </div>
                        <span className="text-[11px] text-slate-600 block mt-0.5 truncate">
                          Penyewa: <strong>{b.client}</strong>
                        </span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] text-amber-700 font-semibold bg-amber-100/70 px-1.5 py-0.5 rounded">
                            Batas: Hari Ini (18:00 WIB)
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openSmartWaModal(b, "return")}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs shrink-0"
                        title="Kirim pengingat pengembalian unit via WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Ingatkan</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="border-b border-slate-200 font-display text-[9px] uppercase tracking-widest text-slate-500 bg-slate-50">
                    <th className="py-4 px-4">ID & Tipe</th>
                    <th className="py-4 px-4">Penyewa</th>
                    <th className="py-4 px-4">Unit Mobil & Tanggal</th>
                    <th className="py-4 px-4">Biaya & Pembayaran</th>
                    <th className="py-4 px-4">Verifikasi KTP</th>
                    <th className="py-4 px-4">Status Sewa</th>
                    <th className="py-4 px-4 text-center">Dokumen & Operasional</th>
                    <th className="py-4 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-650 font-sans">
                  {bookings
                    .filter((b) => {
                      if (bookingFilterStatus !== "All" && b.status !== bookingFilterStatus) return false;
                      if (bookingSearchQuery.trim()) {
                        const q = bookingSearchQuery.toLowerCase();
                        return (
                          b.id.toLowerCase().includes(q) ||
                          b.client.toLowerCase().includes(q) ||
                          b.car.toLowerCase().includes(q) ||
                          b.phone.includes(q)
                        );
                      }
                      return true;
                    })
                    .map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* ID & Tipe */}
                        <td className="py-4 px-4">
                          <span className="font-display font-extrabold text-accent text-xs block">
                            {booking.id}
                          </span>
                          <span className={`inline-block text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded mt-1 border ${
                            booking.rentalType === "Lepas Kunci" 
                              ? "bg-purple-50 text-purple-700 border-purple-200" 
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {booking.rentalType}
                          </span>
                        </td>

                        {/* Penyewa */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-900 block">{booking.client}</span>
                          </div>
                          <a
                            href={`https://wa.me/${booking.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium hover:underline mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{booking.phone}</span>
                          </a>
                          {booking.pickupLocation && (
                            <span className="text-[10px] text-slate-400 block truncate max-w-[150px]" title={booking.pickupLocation}>
                              📍 {booking.pickupLocation}
                            </span>
                          )}
                        </td>

                        {/* Mobil & Periode */}
                        <td className="py-4 px-4">
                          <span className="font-medium text-slate-800 block">{booking.car}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {booking.carPlate} • {booking.durationDays} Hari
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {booking.startDate} s/d {booking.endDate}
                          </span>
                          {booking.extensions && booking.extensions.length > 0 && (
                            <span className="inline-flex items-center space-x-1 text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-1">
                              <Clock className="w-2.5 h-2.5 text-amber-600" />
                              <span>⏳ Diperpanjang +{booking.extensions.reduce((sum, e) => sum + e.extendedDays, 0)} Hari</span>
                            </span>
                          )}
                        </td>

                        {/* Biaya & Status Pembayaran */}
                        <td className="py-4 px-4">
                          <span className="font-display font-extrabold text-slate-900 block" suppressHydrationWarning>
                            {formatCurrency(booking.totalPrice)}
                          </span>
                          <span className={`inline-block text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded mt-1 border ${
                            booking.paymentStatus === "Lunas"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : booking.paymentStatus === "DP Lunas"
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-rose-50 border-rose-200 text-rose-700"
                          }`}>
                            {booking.paymentStatus}
                          </span>

                          {/* Security Deposit Badge for Lepas Kunci */}
                          {booking.rentalType === "Lepas Kunci" && (
                            <button
                              onClick={() => {
                                setSelectedDepositBooking(booking);
                                setRefundBank(booking.refundBankName || "BCA");
                                setRefundAccount(booking.refundAccountNumber || "");
                                setRefundAccName(booking.refundAccountName || booking.client);
                                setRefundDeduction(booking.refundDeductionAmount || 0);
                                setRefundDeductionReason(booking.refundDeductionReason || "");
                              }}
                              className={`mt-1.5 flex items-center space-x-1 text-[8px] font-bold px-1.5 py-0.5 rounded border transition-colors cursor-pointer w-full text-left ${
                                booking.securityDepositStatus === "Refund Selesai"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : booking.securityDepositStatus === "Pemeriksaan ETLE"
                                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                  : booking.securityDepositStatus === "Dipotong Denda"
                                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                  : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                              }`}
                              title="Klik untuk Kelola Uang Jaminan & Cek Tilang ETLE"
                            >
                              <span>🛡️ Jaminan: {booking.securityDepositStatus || "Ditahan"}</span>
                            </button>
                          )}

                          {booking.paymentProofUrl ? (
                            <button
                              onClick={() => setSelectedProofBooking(booking)}
                              className="mt-1.5 flex items-center space-x-1 text-[9px] text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer font-bold animate-pulse shadow-xs"
                              title="Lihat & Verifikasi Bukti Transfer DP Pelanggan"
                            >
                              <span>🧾 Bukti DP Terunggah</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedProofBooking(booking)}
                              className="mt-1.5 flex items-center space-x-1 text-[9px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer font-medium"
                              title="Cek atau Upload Bukti Transfer DP Manual (dari WhatsApp/Bank)"
                            >
                              <span>📎 Cek / Upload Bukti DP</span>
                            </button>
                          )}
                        </td>

                        {/* Verifikasi KTP */}
                        <td className="py-4 px-4">
                          {booking.documents.verified ? (
                            <span className="inline-flex items-center space-x-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>KTP Valid</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedVerificationBooking(booking)}
                              className="inline-flex items-center space-x-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
                              title="Klik untuk verifikasi berkas KTP & SIM"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Cek Berkas</span>
                            </button>
                          )}
                        </td>

                        {/* Status Sewa */}
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[8px] uppercase tracking-widest font-bold border ${
                            booking.status === "Completed"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : booking.status === "Active"
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-amber-50 border-amber-200 text-amber-700"
                          }`}>
                            {booking.status === "Pending" ? "Menunggu" : booking.status === "Active" ? "Berjalan" : "Selesai"}
                          </span>
                        </td>

                        {/* Dokumen & Operasional (Tombol Akses) */}
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* Tombol Berkas KTP */}
                            <button
                              onClick={() => setSelectedVerificationBooking(booking)}
                              className="p-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              title="Verifikasi Dokumen KTP & SIM"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Smart WA Templates */}
                            <button
                              type="button"
                              onClick={() => openSmartWaModal(booking, "dp")}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                              title="Kirim Template Pesan WhatsApp Cepat (Tagihan DP, Unit Siap, Reminder)"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            </button>

                            {/* Tombol Bukti Transfer DP */}
                            <button
                              onClick={() => setSelectedProofBooking(booking)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                booking.paymentProofUrl
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200"
                              }`}
                              title={booking.paymentProofUrl ? "Lihat & Validasi Bukti Transfer DP" : "Cek / Upload Bukti Transfer DP"}
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Cetak Invoice */}
                            <button
                              onClick={() => setSelectedInvoiceBooking(booking)}
                              className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              title="Cetak Invoice Pembayaran"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol SPK Perjanjian */}
                            <button
                              onClick={() => setSelectedContractBooking(booking)}
                              className="p-1.5 bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              title="Cetak Surat Perjanjian Sewa (SPK)"
                            >
                              <FileSignature className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Inspeksi Serah Terima */}
                            <button
                              onClick={() => handleOpenInspection(booking)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                booking.inspection?.checkOut
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                              }`}
                              title="Checklist Serah Terima Kendaraan Digital"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Surat Tugas Driver */}
                            <button
                              onClick={() => {
                                setSelectedDispatchBooking(booking);
                                setDispatchDriverName(booking.driverName || "Bpk. Joko Santoso");
                                setDispatchDriverPhone(booking.driverPhone || "081233445566");
                                setDispatchPickupTime(booking.driverPickupTime || "08:00 WIB");
                                setDispatchNotes(booking.driverNotes || "Bawa papan nama tamu, siapkan kartu E-Toll, pastikan kabin bersih harum.");
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              title="Surat Tugas & Surat Jalan Driver (Kirim WhatsApp Driver)"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>

                            {/* Tombol Pengembalian Deposit (Lepas Kunci) */}
                            {booking.rentalType === "Lepas Kunci" && (
                              <button
                                onClick={() => {
                                  setSelectedDepositBooking(booking);
                                  setRefundBank(booking.refundBankName || "BCA");
                                  setRefundAccount(booking.refundAccountNumber || "");
                                  setRefundAccName(booking.refundAccountName || booking.client);
                                  setRefundDeduction(booking.refundDeductionAmount || 0);
                                  setRefundDeductionReason(booking.refundDeductionReason || "");
                                }}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  booking.securityDepositStatus === "Refund Selesai"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-slate-200"
                                }`}
                                title="Kelola Uang Jaminan Deposit & Pelacak Refund ETLE"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Aksi Cepat */}
                        <td className="py-4 px-4 text-right space-x-1.5">
                          {booking.status === "Pending" && (
                            <button
                              onClick={() => handleApproveBooking(booking.id)}
                              className="bg-accent hover:bg-accent-hover text-white font-display font-semibold text-[8px] uppercase tracking-widest px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer shadow-sm"
                            >
                              Setujui
                            </button>
                          )}
                          {booking.status === "Active" && (
                            <div className="inline-flex items-center space-x-1.5">
                              <button
                                onClick={() => handleOpenExtendBooking(booking)}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-display font-semibold text-[8px] uppercase tracking-widest px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer shadow-sm flex items-center space-x-1"
                                title="Perpanjang Durasi Sewa Armada Ini"
                              >
                                <Clock className="w-2.5 h-2.5" />
                                <span>+ Perpanjang</span>
                              </button>
                              <button
                                onClick={() => handleCompleteBooking(booking.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-[8px] uppercase tracking-widest px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer shadow-sm"
                              >
                                Selesaikan
                              </button>
                            </div>
                          )}
                          {booking.status === "Completed" && (
                            <span className="text-[10px] text-emerald-600 font-bold pr-1">Tuntas ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Kelola Driver */}
        
        {activeTab === "drivers" && (
          <div className="space-y-8 text-left">
            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent font-semibold block">Roster & Logistik</span>
                <h2 className="font-display font-black text-2xl md:text-3xl text-slate-800">Manajemen Tim Driver</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Kelola data pengemudi resmi showroom, lisensi SIM, ketersediaan standby, dan penugasan armada.
                </p>
              </div>

              <button
                onClick={handleOpenAddDriver}
                className="flex items-center space-x-2 bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Driver Baru</span>
              </button>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Tim Driver</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="font-display font-black text-2xl text-slate-900">{drivers.length}</span>
                  <span className="text-xs text-slate-500 font-medium">Orang</span>
                </div>
              </div>

              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Driver Standby (Siap)</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="font-display font-black text-2xl text-emerald-800">
                    {drivers.filter(d => d.status === "Standby").length}
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">Siap Bertugas</span>
                </div>
              </div>

              <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Sedang Di Jalan (On Trip)</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="font-display font-black text-2xl text-blue-800">
                    {drivers.filter(d => d.status === "On Trip").length}
                  </span>
                  <span className="text-xs text-blue-600 font-medium">Bertugas</span>
                </div>
              </div>

              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Rata-rata Rating</span>
                <div className="flex items-baseline space-x-2 mt-1">
                  <span className="font-display font-black text-2xl text-amber-800">
                    {(drivers.reduce((acc, d) => acc + d.rating, 0) / (drivers.length || 1)).toFixed(2)}
                  </span>
                  <span className="text-xs text-amber-600 font-semibold flex items-center">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline mr-1" /> / 5.0
                  </span>
                </div>
              </div>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map((driver) => {
                const isStandby = driver.status === "Standby";
                const isOnTrip = driver.status === "On Trip";

                return (
                  <div
                    key={driver.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                  >
                    {/* Top Info */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3.5">
                          <div className="relative">
                            <img
                              src={driver.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"}
                              alt={driver.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-slate-100 shadow-inner"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <span
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                isStandby ? "bg-emerald-500" : isOnTrip ? "bg-blue-500" : "bg-slate-400"
                              }`}
                              title={`Status: ${driver.status}`}
                            />
                          </div>

                          <div>
                            <span className="font-display font-bold text-sm text-slate-900 block">{driver.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono block">{driver.phone}</span>
                            <div className="flex items-center space-x-1 text-amber-500 text-[11px] font-bold mt-0.5">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{driver.rating.toFixed(2)}</span>
                              <span className="text-slate-400 font-normal">&bull; {driver.totalTrips} Trip</span>
                            </div>
                          </div>
                        </div>

                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isStandby
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isOnTrip
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {driver.status}
                        </span>
                      </div>

                      {/* License Info Box */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Golongan Lisensi</span>
                          <span className="font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px]">
                            {driver.simType}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">No. SIM:</span>
                          <span className="font-mono font-medium text-slate-800">{driver.simNumber}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">Masa Berlaku:</span>
                          <span className="text-slate-700 font-medium">{driver.simExpiry}</span>
                        </div>
                      </div>

                      {/* Notes / Specialization */}
                      {driver.notes && (
                        <p className="text-[11px] text-slate-600 italic bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                          &ldquo;{driver.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Status Quick Switcher & Actions */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1.5">
                          Ubah Status Ketersediaan
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["Standby", "On Trip", "Off"] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                const updated = drivers.map(d => d.id === driver.id ? { ...d, status: st } : d);
                                saveDriversList(updated);
                                setToastMessage(`Status ${driver.name} diubah menjadi "${st}"`);
                                setShowToast(true);
                                setTimeout(() => setShowToast(false), 3000);
                              }}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center ${
                                driver.status === st
                                  ? st === "Standby"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : st === "On Trip"
                                    ? "bg-blue-600 text-white shadow-xs"
                                    : "bg-slate-700 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {st === "Standby" ? "🟢 Siap" : st === "On Trip" ? "🟡 Jalan" : "⚪ Libur"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 pt-1">
                        <a
                          href={`https://wa.me/${driver.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Halo ${driver.name}, tim dispatcher showroom ingin melakukan konfirmasi ketersediaan tugas hari ini.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center space-x-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Hubungi WA</span>
                        </a>

                        <button
                          onClick={() => handleOpenEditDriver(driver)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                          title="Edit Data Driver"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteDriver(driver.id)}
                          className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                          title="Hapus Driver"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}



        {/* TAB: Blog / Artikel List */}
        {activeTab === "blog" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-extrabold text-xl text-slate-800 text-left">Kelola Jurnal & Artikel</h3>
              <button
                onClick={() => {
                  setEditingBlogPost(null);
                  setIsBlogFormOpen(true);
                }}
                className="flex items-center space-x-2 bg-accent hover:bg-accent-hover text-white font-display font-semibold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all focus:outline-none cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tulis Artikel Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group">
                  <div className="aspect-[16/10] w-full bg-slate-100 overflow-hidden relative">
                    <img src={post.image} className="w-full h-full object-cover" alt="" />
                    <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[8px] px-2 py-0.5 rounded font-bold">
                      {post.category}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-white/95 text-slate-800 text-[8px] px-2 py-0.5 rounded font-bold border border-slate-200 shadow-sm">
                      {post.date}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1 text-left">
                      <h4 className="font-display font-bold text-sm text-slate-800 line-clamp-1">
                        {post.title}
                      </h4>
                      <p className="font-sans font-light text-slate-500 text-[10px] leading-relaxed line-clamp-2">
                        {post.snippet}
                      </p>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setEditingBlogPost(post);
                          setIsBlogFormOpen(true);
                        }}
                        className="flex items-center space-x-1 text-blue-500 hover:text-blue-700 font-display text-[9px] uppercase tracking-wider font-semibold py-1 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Hapus artikel ini?")) {
                            updateAndSaveBlogPosts(blogPosts.filter(p => p.id !== post.id));
                          }
                        }}
                        className="flex items-center space-x-1 text-red-500 hover:text-red-700 font-display text-[9px] uppercase tracking-wider font-semibold py-1 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <Trash className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6 text-left">
            {/* Header & Quick Save */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-200/90 rounded-2xl shadow-xs">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent font-bold block">
                  System Preferences & Configuration
                </span>
                <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900">
                  Pengaturan & Konfigurasi Showroom
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Pusat kendali kebijakan tarif sewa, profil showroom, dynamic pricing, dan keamanan sistem.
                </p>
              </div>

              <button
                onClick={handleSaveSettings}
                className="bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer flex items-center space-x-2 self-start sm:self-auto"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>

            {/* Sub-Navigation Tabs Bar */}
            <div className="flex items-center space-x-1.5 overflow-x-auto bg-white p-2 border border-slate-200/90 rounded-2xl shadow-xs text-xs font-semibold">
              {[
                { id: "rates", label: "Tarif & Ketentuan", icon: <Wallet className="w-3.5 h-3.5" /> },
                { id: "contact", label: "Kontak & SEO", icon: <Phone className="w-3.5 h-3.5" /> },
                { id: "pricing", label: "Dynamic Pricing", icon: <TrendingUp className="w-3.5 h-3.5" /> },
                { id: "notif", label: "Notifikasi & Audio", icon: <Bell className="w-3.5 h-3.5" /> },
                { id: "security", label: "Keamanan & Backup", icon: <Lock className="w-3.5 h-3.5" /> },
                { id: "all", label: "Tampilkan Semua", icon: <Sliders className="w-3.5 h-3.5" /> },
              ].map((sub) => {
                const isActive = settingsSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSettingsSubTab(sub.id as any)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span className={isActive ? "text-accent" : "text-slate-400"}>{sub.icon}</span>
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SECTION 1: TARIF & ATURAN RENTAL */}
            {(settingsSubTab === "rates" || settingsSubTab === "all") && (
              <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-5">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900">1. Konfigurasi Tarif & Aturan Rental</h3>
                    <p className="text-[11px] text-slate-500">Kebijakan uang jaminan, denda keterlambatan, biaya sopir, dan pajak</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                      Jaminan Deposit Kerusakan (IDR)
                    </label>
                    <input
                      type="number"
                      value={settings.depositAmount}
                      onChange={(e) => setSettings({ ...settings, depositAmount: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                    />
                    <span className="text-[10px] text-slate-400">Titipan refundable saat sewa lepas kunci</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                      Tarif Overtime / Jam (Late Fee)
                    </label>
                    <input
                      type="number"
                      value={settings.lateFeePerHour}
                      onChange={(e) => setSettings({ ...settings, lateFeePerHour: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                    />
                    <span className="text-[10px] text-slate-400">Denda jika unit lewat batas jam kembali</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                      Tarif Jasa Sopir Harian (IDR)
                    </label>
                    <input
                      type="number"
                      value={settings.driverServiceRate}
                      onChange={(e) => setSettings({ ...settings, driverServiceRate: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                    />
                    <span className="text-[10px] text-slate-400">Biaya per hari untuk tipe Dengan Sopir</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                      Pajak Negara PPN (%)
                    </label>
                    <input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => setSettings({ ...settings, taxRate: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                    />
                    <span className="text-[10px] text-slate-400">PPN (isi 0 jika harga sudah include pajak)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                      Template Pesan WhatsApp Order
                    </label>
                    <textarea
                      value={whatsappTemplate}
                      onChange={(e) => setWhatsappTemplate(e.target.value)}
                      placeholder="Contoh: Halo Gino Rent Car, saya tertarik sewa mobil [Nama Mobil]..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors h-24 resize-none leading-relaxed"
                    />
                    <span className="text-[10px] text-slate-400">Format pesan pembuka saat pelanggan mengklik tombol WhatsApp mobil</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                      Syarat & Ketentuan Sewa (Pisahkan dengan Baris Baru)
                    </label>
                    <textarea
                      value={rentalTerms}
                      onChange={(e) => setRentalTerms(e.target.value)}
                      placeholder="Masukkan syarat sewa (satu poin per baris)..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors h-24 leading-relaxed"
                    />
                    <span className="text-[10px] text-slate-400">Poin persyaratan yang tampil pada formulir booking penyewa</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: KONTAK SHOWROOM & SEO */}
            {(settingsSubTab === "contact" || settingsSubTab === "all") && (
              <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-5">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900">2. Informasi Kontak Showroom & SEO Google</h3>
                    <p className="text-[11px] text-slate-500">Nomor kontak resmi CS, alamat pool, tautan medsos, dan optimasi mesin pencari</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-sans">
                  {/* Left Column: Kontak & Alamat */}
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                        Nomor WhatsApp CS (Tanpa +, Contoh: 6281234567890)
                      </label>
                      <input
                        type="text"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="Contoh: 6281234567890"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                          Hotline CS Telepon
                        </label>
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="Contoh: +62 21-8080-9999"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                          Email Support Showroom
                        </label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="Contoh: support@royaldrive.com"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                        Alamat Lengkap Showroom (Teks)
                      </label>
                      <textarea
                        value={showroomAddress}
                        onChange={(e) => setShowroomAddress(e.target.value)}
                        placeholder="Masukkan alamat showroom pusat..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors h-18 resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                        Kode Embed Google Maps (Iframe / Link)
                      </label>
                      <textarea
                        value={googleMapsLink}
                        onChange={(e) => setGoogleMapsLink(e.target.value)}
                        placeholder="Masukkan kode <iframe src='...'></iframe> atau link Google Maps"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors h-18 resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Medsos & SEO */}
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block truncate">
                          Instagram URL
                        </label>
                        <input
                          type="text"
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                          placeholder="https://instagram.com/..."
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block truncate">
                          TikTok URL
                        </label>
                        <input
                          type="text"
                          value={tiktokUrl}
                          onChange={(e) => setTiktokUrl(e.target.value)}
                          placeholder="https://tiktok.com/@..."
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block truncate">
                          Facebook URL
                        </label>
                        <input
                          type="text"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                        SEO Title (Browser Tab Title)
                      </label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Contoh: Royal Drive | Sewa Mobil Mewah & Lepas Kunci Cisoka"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                        SEO Meta Description
                      </label>
                      <textarea
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Masukkan deskripsi singkat pencarian Google..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors h-16 resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                        SEO Meta Keywords (Pisahkan dengan Koma)
                      </label>
                      <input
                        type="text"
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        placeholder="Contoh: rental mobil cisoka, sewa alphard tangerang"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                      />
                    </div>

                    {/* Google Snippet Simulator */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Pratinjau Hasil Pencarian Google:
                      </span>
                      <div className="text-left font-sans">
                        <span className="text-[10px] text-emerald-700 block truncate">https://royaldrive.id</span>
                        <h4 className="text-xs text-blue-800 font-bold hover:underline cursor-pointer truncate">
                          {seoTitle || "Royal Drive | Rental Mobil Mewah & Lepas Kunci Cisoka"}
                        </h4>
                        <p className="text-[10px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                          {seoDescription || "Layanan sewa mobil mewah terlengkap di Cisoka dan Tangerang. Unit bersih, wangi, siap jalan dengan tarif kompetitif."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: DYNAMIC PRICING (PEAK SEASON SURCHARGE) */}
            {(settingsSubTab === "pricing" || settingsSubTab === "all") && (
              <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-900">
                        3. Aturan Tarif Musiman & Akhir Pekan (Dynamic Peak Season)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Kenaikan tarif sewa otomatis saat weekend atau musim liburan tinggi (Lebaran, Nataru, Libur Sekolah)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddSeason}
                    className="inline-flex items-center space-x-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Musim Libur</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pricingSeasons.map((season) => (
                    <div 
                      key={season.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        season.isActive 
                          ? "bg-amber-50/40 border-amber-200 shadow-2xs" 
                          : "bg-slate-50 border-slate-200 opacity-60"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className={`w-2 h-2 rounded-full ${season.isActive ? "bg-amber-500 animate-pulse" : "bg-slate-400"}`} />
                              <h4 className="font-display font-bold text-xs text-slate-900 truncate">{season.name}</h4>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              {season.type === "weekend" ? "Otomatis setiap Sabtu & Minggu" : `${season.startDate} s/d ${season.endDate}`}
                            </span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={season.isActive}
                              onChange={() => handleToggleSeason(season.id)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-600" />
                          </label>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {season.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kenaikan:</span>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={season.surchargePercent}
                              onChange={(e) => handleUpdateSeasonPercent(season.id, Number(e.target.value))}
                              className="w-14 bg-white border border-slate-200 text-center font-bold text-xs text-amber-800 py-1 rounded-lg focus:outline-none focus:border-amber-500"
                            />
                            <span className="text-xs font-bold text-amber-800">%</span>
                          </div>
                        </div>

                        {season.id !== "weekend-default" && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSeason(season.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Musim Libur"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: NOTIFIKASI REAL-TIME & SUARA BEL */}
            {(settingsSubTab === "notif" || settingsSubTab === "all") && (
              <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-5">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900">
                      4. Pengaturan Notifikasi Booking Masuk & Suara Bel
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Konfigurasi alarm audio chime dan push notifikasi desktop browser saat pelanggan memesan mobil
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  {/* Audio Chime Card */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-display font-bold text-xs text-slate-900">Suara Bel Notifikasi (Audio Chime)</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            soundEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                          }`}>
                            {soundEnabled ? "Aktif" : "Bisu"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Memainkan nada 3-akord mewah saat pelanggan menyelesaikan formulir verifikasi booking di halaman web.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-3 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={toggleSound}
                        className={`flex-1 text-xs font-bold py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                          soundEnabled
                            ? "bg-slate-200 hover:bg-slate-300 text-slate-800"
                            : "bg-accent hover:bg-accent-hover text-white shadow-xs"
                        }`}
                      >
                        {soundEnabled ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{soundEnabled ? "Nonaktifkan Suara" : "Aktifkan Bel"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleTestSound}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Uji Suara</span>
                      </button>
                    </div>
                  </div>

                  {/* Desktop Push Notification Card */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-display font-bold text-xs text-slate-900">Push Notifikasi Desktop (OS Level)</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            desktopNotifState === "granted"
                              ? "bg-emerald-100 text-emerald-800"
                              : desktopNotifState === "denied"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {desktopNotifState === "granted" ? "Diizinkan" : desktopNotifState === "denied" ? "Diblokir" : "Belum Aktif"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Menampilkan banner notifikasi resmi di pojok kanan bawah desktop laptop/PC Anda saat ada pesanan baru.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60">
                      {desktopNotifState === "granted" ? (
                        <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center font-semibold">
                          Push notifikasi desktop aktif. Anda akan menerima notifikasi bahkan saat tab admin terminimize.
                        </div>
                      ) : desktopNotifState === "denied" ? (
                        <div className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center font-medium">
                          Izin notifikasi diblokir di browser. Klik ikon gembok di sebelah address bar browser untuk mengubah izin ke "Allow".
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRequestDesktopPush}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          <Bell className="w-4 h-4" />
                          <span>Aktifkan Izin Notifikasi Desktop</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: KEAMANAN & BACKUP DATABASE */}
            {(settingsSubTab === "security" || settingsSubTab === "all") && (
              <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-5">
                <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900">
                      5. Keamanan Akun Administrator & Cadangan Database Showroom
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Ekspor/impor seluruh data booking & armada, serta perbarui password akses Super Administrator
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-sans">
                  {/* Backup & Restore Column */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2.5 mb-2">
                        <Database className="w-4 h-4 text-accent" />
                        <h4 className="font-display font-bold text-xs text-slate-900">Pencadangan & Pemulihan Database (.JSON)</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Unduh salinan offline seluruh data booking, pelanggan, armada, ulasan, dan pengaturan ke komputer Anda. File ini dapat dipulihkan kapan saja di perangkat apa pun.
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={handleExportFullBackup}
                        className="w-full inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-display font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-amber-400" />
                        <span>Download Cadangan Database (.JSON)</span>
                      </button>

                      <label className="w-full inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-display font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-xs cursor-pointer">
                        <RefreshCw className="w-4 h-4" />
                        <span>Pilih File JSON untuk Dipulihkan</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportFullBackup}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Password Form Column */}
                  <form onSubmit={handleChangeAdminPassword} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                    <div className="flex items-center space-x-2.5 mb-1">
                      <Key className="w-4 h-4 text-accent" />
                      <h4 className="font-display font-bold text-xs text-slate-900">Perbarui Kredensial Super Admin</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                          Email Administrator
                        </label>
                        <input
                          type="email"
                          value={adminEmailSetting}
                          onChange={(e) => setAdminEmailSetting(e.target.value)}
                          required
                          placeholder="admin@royaldrive.com"
                          className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-xl font-sans text-xs focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                          Password Saat Ini
                        </label>
                        <input
                          type="password"
                          value={currAdminPass}
                          onChange={(e) => setCurrAdminPass(e.target.value)}
                          required
                          placeholder="Password lama"
                          className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-xl font-sans text-xs focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                          Password Baru
                        </label>
                        <input
                          type="password"
                          value={newAdminPass}
                          onChange={(e) => setNewAdminPass(e.target.value)}
                          required
                          placeholder="Min. 5 karakter"
                          className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-xl font-sans text-xs focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                          Konfirmasi Password
                        </label>
                        <input
                          type="password"
                          value={confirmAdminPass}
                          onChange={(e) => setConfirmAdminPass(e.target.value)}
                          required
                          placeholder="Ketik ulang password"
                          className="w-full bg-white border border-slate-200 text-slate-900 px-3 py-2 rounded-xl font-sans text-xs focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-start">
                      <button
                        type="submit"
                        className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>Perbarui Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Bottom Save Bar */}
            <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-slate-500 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan yang disimpan akan langsung aktif secara realtime di seluruh sistem showroom.</span>
              </div>
              <button
                onClick={handleSaveSettings}
                className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-accent/20 focus:outline-none flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Semua Pengaturan</span>
              </button>
            </div>
          </div>
        )}{/* TAB 6: Kelola Testimoni */}
        {activeTab === "testimonials" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-left">
              <div>
                <h3 className="font-display font-extrabold text-xl text-slate-800">Kelola Ulasan Pelanggan</h3>
                <span className="text-xs text-slate-500 font-medium">Atur testimoni bintang 5 yang tampil di halaman depan</span>
              </div>
              <button
                onClick={() => {
                  setEditingTestimonial(null);
                  setIsTestimonialFormOpen(true);
                }}
                className="flex items-center space-x-2 bg-accent hover:bg-accent-hover text-white font-display font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all focus:outline-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Testimoni</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {testimonials.map((test) => (
                <div key={test.id} className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between space-y-4 relative shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={test.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
                        <div>
                          <span className="font-display font-bold text-xs text-slate-800 block">{test.name}</span>
                          <span className="text-[10px] text-slate-500 block">{test.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-0.5">
                        {Array.from({ length: test.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs font-sans italic leading-relaxed">&ldquo;{test.text}&rdquo;</p>
                    
                    {test.videoThumb && (
                      <div className="inline-flex items-center space-x-1 text-[9px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                        <Play className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                        <span>Video Review Aktif</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200/60">
                    <button
                      onClick={() => {
                        setEditingTestimonial(test);
                        setIsTestimonialFormOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all cursor-pointer focus:outline-none"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Hapus ulasan ini?")) {
                          const remaining = testimonials.filter(t => t.id !== test.id);
                          updateAndSaveTestimonials(remaining);
                        }
                      }}
                      className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer focus:outline-none"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: Kelola FAQ */}
        {activeTab === "faqs" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-left">
              <div>
                <h3 className="font-display font-extrabold text-xl text-slate-800">Kelola FAQ (Tanya Jawab)</h3>
                <span className="text-xs text-slate-500 font-medium">Perbarui daftar pertanyaan umum untuk calon penyewa</span>
              </div>
              <button
                onClick={() => {
                  const q = prompt("Masukkan Pertanyaan:");
                  const a = prompt("Masukkan Jawaban:");
                  if (q && a) {
                    const newFaq: FAQItem = { question: q, answer: a };
                    updateAndSaveFaqs([...faqs, newFaq]);
                  }
                }}
                className="flex items-center space-x-2 bg-accent hover:bg-accent-hover text-white font-display font-semibold text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all focus:outline-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah FAQ</span>
              </button>
            </div>

            <div className="space-y-4 text-left">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative shadow-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-display font-bold text-sm text-slate-800 block pr-8">
                      ❓ {faq.question}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm("Hapus FAQ ini?")) {
                          updateAndSaveFaqs(faqs.filter((_, i) => i !== idx));
                        }
                      }}
                      className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer focus:outline-none absolute top-4 right-4"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs font-sans leading-relaxed pt-2 border-t border-slate-200/60">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8.5: Kelola Tampilan */}
        {activeTab === "appearance" && (
          <div className="space-y-6 text-left max-w-6xl mx-auto">
            {/* Header with Title & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent font-bold block">
                  Branding & Visual Presentation
                </span>
                <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900">
                  Kelola Tampilan & Banner Showroom
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Atur identitas brand showroom, logo resmi, teks sambutan hero, dan galeri banner latar belakang beranda.
                </p>
              </div>

              <div className="flex items-center space-x-2.5 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleResetAppearance}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200 cursor-pointer flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAppearance}
                  className="px-5 py-2 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan Tampilan</span>
                </button>
              </div>
            </div>

            {/* Sub-Tab Navigation Bar */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "all", label: "Tampilkan Semua", icon: <Sliders className="w-3.5 h-3.5" /> },
                { id: "brand", label: "1. Identitas & Logo Brand", icon: <Image className="w-3.5 h-3.5" /> },
                { id: "hero", label: "2. Teks Banner Hero Utama", icon: <Sparkles className="w-3.5 h-3.5" /> },
                { id: "slideshow", label: `3. Background Slideshow (${bgImages.length})`, icon: <Grid className="w-3.5 h-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAppearanceSubTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    appearanceSubTab === tab.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* SECTION 1: Identitas & Logo Brand Showroom */}
            {(appearanceSubTab === "all" || appearanceSubTab === "brand") && (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    <Image className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">1. Identitas Brand & Logo Showroom</h3>
                    <p className="text-xs text-slate-500">Nama resmi dan logo showroom yang tampil pada navbar, faktur, dan perjanjian sewa.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Kolom Kiri: Input Nama & Upload Logo */}
                  <div className="lg:col-span-6 space-y-5 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Nama Resmi Showroom / Brand:
                      </label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Contoh: ROYAL DRIVE"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors font-medium"
                      />
                      <p className="text-[11px] text-slate-400">Nama ini digunakan pada kop surat faktur kuitansi, surat perjanjian, dan WhatsApp.</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 block">
                          Logo Showroom:
                        </label>
                        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setLogoInputMode("upload")}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                              logoInputMode === "upload" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogoInputMode("url")}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                              logoInputMode === "url" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Input Link URL
                          </button>
                        </div>
                      </div>

                      {logoInputMode === "upload" ? (
                        <label className="border-2 border-dashed border-slate-300 hover:border-accent bg-slate-50/60 hover:bg-slate-50 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
                          <div className="w-10 h-10 rounded-full bg-amber-50 text-accent flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800">Klik untuk upload file gambar logo</span>
                          <span className="text-[11px] text-slate-400 mt-0.5">Format didukung: PNG, JPG, SVG, WebP (Rekomendasi PNG transparan)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressImage(file, 600, 300, 0.85);
                                  setLogoUrl(compressed);
                                } catch (err) {
                                  console.error(err);
                                  alert("Gagal memproses gambar logo.");
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://domain.com/images/logo-showroom.png"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors"
                          />
                          <p className="text-[11px] text-slate-400">Masukkan tautan URL langsung ke file gambar logo showroom Anda.</p>
                        </div>
                      )}

                      {logoUrl && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Logo kustom aktif digunakan</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setLogoUrl("")}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                          >
                            Hapus Logo & Gunakan Inisial RD
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Kolom Kanan: Pratinjau Navbar Nyata */}
                  <div className="lg:col-span-6 bg-slate-50 border border-slate-200/80 rounded-xl p-4.5 space-y-4 text-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Pratinjau Logo Pada Bilah Navigasi Publik:
                    </span>

                    {/* Pratinjau Mode Gelap Mewah */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-slate-400">Tampilan Pada Navbar Hitam Mewah:</span>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between shadow-inner">
                        <div className="flex items-center space-x-3">
                          {logoUrl ? (
                            <img src={logoUrl} className="h-7 max-w-[130px] object-contain" alt="Logo" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-display font-black text-xs shadow-xs">
                              RD
                            </div>
                          )}
                          <span className="font-display font-black text-xs text-white uppercase tracking-wider">
                            {brandName || "ROYAL DRIVE"}
                          </span>
                        </div>
                        <div className="hidden sm:flex items-center space-x-3 text-[10px] text-slate-400 font-medium">
                          <span className="text-accent font-bold">Beranda</span>
                          <span>Armada</span>
                          <span>Kontak</span>
                        </div>
                      </div>
                    </div>

                    {/* Pratinjau Mode Terang */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-slate-400">Tampilan Pada Navbar Terang / Dokumen:</span>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center space-x-3">
                          {logoUrl ? (
                            <img src={logoUrl} className="h-7 max-w-[130px] object-contain" alt="Logo" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-display font-black text-xs">
                              RD
                            </div>
                          )}
                          <span className="font-display font-black text-xs text-slate-900 uppercase tracking-wider">
                            {brandName || "ROYAL DRIVE"}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">Invoice / Nota Preview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: Teks Banner Hero Utama */}
            {(appearanceSubTab === "all" || appearanceSubTab === "hero") && (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">2. Teks Banner Hero Utama</h3>
                    <p className="text-xs text-slate-500">Judul headline dan kalimat pembuka utama di bagian atas halaman beranda.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Kolom Kiri: Input Judul & Sub-judul */}
                  <div className="lg:col-span-6 space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Judul Utama Banner (Hero Title): *
                      </label>
                      <input
                        type="text"
                        value={heroTitle}
                        onChange={(e) => setHeroTitle(e.target.value)}
                        placeholder="Contoh: Sewa Mobil Mewah & Lepas Kunci Tangerang"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors font-medium"
                      />
                      <p className="text-[11px] text-slate-400">Gunakan judul yang memikat, memuat kata kunci kota dan jenis rental Anda.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Sub-judul Tagline Sambutan (Hero Subtitle): *
                      </label>
                      <textarea
                        rows={4}
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        placeholder="Masukkan deskripsi singkat keunggulan armada dan layanan showroom..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent focus:bg-white transition-colors leading-relaxed"
                      />
                      <p className="text-[11px] text-slate-400">Rangkuman 2-3 kalimat mengenai kelebihan armada prima, sopir profesional, atau syarat mudah.</p>
                    </div>
                  </div>

                  {/* Kolom Kanan: Pratinjau Nyata Hero Banner */}
                  <div className="lg:col-span-6 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Pratinjau Di Halaman Beranda:
                    </span>
                    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-md aspect-video flex flex-col justify-end p-5 text-left bg-slate-950">
                      {bgImages[0] && (
                        <img
                          src={bgImages[0]}
                          alt="Hero Preview"
                          className="absolute inset-0 w-full h-full object-cover opacity-45"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                      
                      <div className="relative z-10 space-y-2">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                          <span>{brandName || "ROYAL DRIVE"} EXPERIENCE</span>
                        </span>
                        <h4 className="font-display font-black text-sm sm:text-base md:text-lg text-white leading-tight drop-shadow-sm">
                          {heroTitle || "Sewa Mobil Mewah & Lepas Kunci Tangerang"}
                        </h4>
                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                          {heroSubtitle || "Armada terlengkap, unit prima terawat, harga transparan, dan sopir profesional berpengalaman."}
                        </p>
                        <div className="pt-1 flex items-center space-x-2">
                          <span className="px-3 py-1 bg-accent text-white font-bold text-[10px] rounded-lg shadow-xs">
                            Booking Sekarang
                          </span>
                          <span className="px-3 py-1 bg-white/10 text-white font-medium text-[10px] rounded-lg">
                            Lihat Armada
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: Background Slideshow Banner */}
            {(appearanceSubTab === "all" || appearanceSubTab === "slideshow") && (
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shrink-0">
                      <Grid className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-display font-bold text-base text-slate-900">3. Background Slideshow Banner</h3>
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                          {bgImages.length} Foto Aktif
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Koleksi foto latar belakang yang berputar otomatis di halaman utama.</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Foto Baru</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file, 1200, 800, 0.65);
                              setBgImages([...bgImages, compressed]);
                            } catch (err) {
                              console.error(err);
                              alert("Gagal memproses gambar latar belakang.");
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsAddingSlideUrl(!isAddingSlideUrl)}
                      className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-slate-200"
                    >
                      <span>{isAddingSlideUrl ? "Tutup Form URL" : "+ Input Link URL"}</span>
                    </button>
                  </div>
                </div>

                {/* Inline URL Input Form */}
                {isAddingSlideUrl && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in-50 duration-150">
                    <span className="text-xs font-bold text-slate-800 block">Tambah Slide dari URL Online:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newSlideUrlInput}
                        onChange={(e) => setNewSlideUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSlideUrlInput.trim()) {
                            setBgImages([...bgImages, newSlideUrlInput.trim()]);
                            setNewSlideUrlInput("");
                            setIsAddingSlideUrl(false);
                          }
                        }}
                        className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                      >
                        Tambah Slide
                      </button>
                    </div>
                  </div>
                )}

                {/* Grid of Slide Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {bgImages.map((img, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between group hover:shadow-md transition-shadow">
                      <div className="aspect-video w-full bg-slate-200 overflow-hidden relative">
                        <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                        <span className="absolute top-2 left-2 bg-slate-950/80 text-white text-[9px] px-2 py-0.5 rounded-md font-bold backdrop-blur-xs">
                          Slide {idx + 1} {idx === 0 ? "(Utama)" : ""}
                        </span>
                      </div>
                      <div className="p-2.5 flex items-center justify-between border-t border-slate-200 bg-white">
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{img}</span>
                        <button
                          type="button"
                          disabled={bgImages.length <= 1}
                          onClick={() => {
                            if (confirm("Hapus slide ini dari banner beranda?")) {
                              setBgImages(bgImages.filter((_, i) => i !== idx));
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          title="Hapus Slide"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center space-x-2 text-blue-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Rekomendasi gambar: Rasio aspek 16:9 dengan resolusi minimal 1920x1080px untuk ketajaman optimal di layar desktop & ponsel.</span>
                </div>
              </div>
            )}

            {/* Bottom Sticky Save Bar */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-slate-500 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Seluruh pengunjung website akan langsung melihat banner dan logo terbaru setelah disimpan.</span>
              </div>
              <div className="flex items-center space-x-2.5 self-stretch sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleResetAppearance}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200 cursor-pointer"
                >
                  Reset Default
                </button>
                <button
                  type="button"
                  onClick={handleSaveAppearance}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan Tampilan</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SERVIS & PAJAK ARMADA */}
        {activeTab === "maintenance" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent font-semibold block">Fleet Maintenance & Compliance</span>
                <h2 className="font-display font-black text-2xl md:text-3xl text-slate-800">Servis & Pajak STNK Armada</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Pantau kepatuhan pajak tahunan, plat nomor 5 tahunan, dan odometer jadwal ganti oli armada.</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    const firstCar = complianceList[0];
                    if (firstCar) {
                      setSelectedCarForService(firstCar);
                      setServiceOdo(firstCar.currentOdo);
                    }
                  }}
                  className="bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-all shadow-md shadow-accent/15 flex items-center space-x-2 cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>+ Catat Servis Bengkel</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 text-left">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 block">Jatuh Tempo Pajak</span>
                  <AlertTriangle className={`w-4 h-4 ${urgentTaxCount > 0 ? "text-amber-500 animate-bounce" : "text-slate-400"}`} />
                </div>
                <span className={`font-display font-black text-2xl ${urgentTaxCount > 0 ? "text-amber-600" : "text-slate-800"}`}>
                  {urgentTaxCount} Unit
                </span>
                <span className="text-[9px] text-slate-500 block mt-1 font-sans">Kurang dari 30 hari ke depan</span>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 block">Wajib Servis / Oli</span>
                  <Wrench className={`w-4 h-4 ${urgentServiceCount > 0 ? "text-red-500 animate-pulse" : "text-slate-400"}`} />
                </div>
                <span className={`font-display font-black text-2xl ${urgentServiceCount > 0 ? "text-red-600" : "text-slate-800"}`}>
                  {urgentServiceCount} Unit
                </span>
                <span className="text-[9px] text-slate-500 block mt-1 font-sans">Sisa KM &le; 500 KM atau terlampaui</span>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 block">Biaya Bengkel Tercatat</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-display font-black text-xl text-slate-900" suppressHydrationWarning>
                  {formatCurrency(totalMaintenanceCost)}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1 font-sans">Dari {maintenanceRecords.length} kali perawatan</span>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 block">Total Armada Terdaftar</span>
                  <Car className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-display font-black text-2xl text-slate-800">
                  {complianceList.length} Unit
                </span>
                <span className="text-[9px] text-emerald-600 font-sans font-medium block mt-1">100% Tercover Asuransi</span>
              </div>
            </div>

            {/* TABEL PEMANTAUAN SERVIS & LEGALITAS PAJAK ARMADA */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm text-left">
              <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-slate-800">Status Legalitas & Servis Armada</h3>
                  <span className="text-[10px] text-slate-500 font-sans">Data diperbarui otomatis dari log inspeksi dan perawatan berkala</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-100/70 text-slate-700 uppercase font-display text-[9px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Armada & Plat Nomor</th>
                      <th className="p-4">Odometer & Servis Berikutnya</th>
                      <th className="p-4">Pajak Tahunan (PKB)</th>
                      <th className="p-4">Plat 5 Tahunan</th>
                      <th className="p-4">Asuransi All-Risk</th>
                      <th className="p-4 text-right">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complianceList.map((comp) => {
                      const taxDays = Math.ceil((new Date(comp.taxExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const plateDays = Math.ceil((new Date(comp.plateExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const kmRemaining = comp.nextServiceOdo - comp.currentOdo;
                      const serviceProgress = Math.min(100, Math.max(0, Math.round(((comp.currentOdo - comp.lastServiceOdo) / Math.max(1, comp.nextServiceOdo - comp.lastServiceOdo)) * 100)));

                      return (
                        <tr key={comp.carId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <strong className="text-slate-900 block font-display text-xs">{comp.carName}</strong>
                            <span className="font-mono text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded inline-block mt-1">
                              {comp.carPlate}
                            </span>
                          </td>

                          <td className="p-4 min-w-[200px]">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-slate-600 font-mono font-semibold">{comp.currentOdo.toLocaleString("id-ID")} KM</span>
                              <span className="text-slate-400 font-mono text-[10px]">Target: {comp.nextServiceOdo.toLocaleString("id-ID")} KM</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  kmRemaining <= 0
                                    ? "bg-red-600"
                                    : kmRemaining <= 500
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${serviceProgress}%` }}
                              />
                            </div>
                            <div className="mt-1">
                              {kmRemaining <= 0 ? (
                                <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md inline-block">
                                  ⚠️ Telat {Math.abs(kmRemaining).toLocaleString("id-ID")} KM (Wajib Servis!)
                                </span>
                              ) : kmRemaining <= 500 ? (
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                                  ⏳ Sisa {kmRemaining.toLocaleString("id-ID")} KM (Segera Ganti Oli)
                                </span>
                              ) : (
                                <span className="text-[9px] text-emerald-700 font-medium">
                                  ✓ Sisa {kmRemaining.toLocaleString("id-ID")} KM lagi
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="font-mono text-xs block text-slate-800 font-semibold">{comp.taxExpiryDate}</span>
                            {taxDays < 0 ? (
                              <span className="text-[9px] font-bold bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-md inline-block mt-0.5 animate-pulse">
                                🚨 Pajak Mati ({Math.abs(taxDays)} hari lalu)
                              </span>
                            ) : taxDays <= 30 ? (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                ⚠️ Sisa {taxDays} Hari Lagi
                              </span>
                            ) : (
                              <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                ✓ Aman ({taxDays} hari)
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <span className="font-mono text-xs block text-slate-800 font-semibold">{comp.plateExpiryDate}</span>
                            <span className="text-[9px] text-slate-500 font-sans">
                              {plateDays > 365 ? `${Math.round(plateDays / 365)} Tahun lagi` : `${plateDays} Hari lagi`}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-slate-800 text-[11px] block">{comp.insuranceName}</span>
                            <span className="font-mono text-[10px] text-slate-500 block">No: {comp.insurancePolicyNo}</span>
                            <span className="text-[9px] text-slate-400">Exp: {comp.insuranceExpiryDate}</span>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => {
                                  setSelectedCarForService(comp);
                                  setServiceOdo(comp.currentOdo);
                                }}
                                className="p-2 text-slate-600 hover:text-accent hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 text-xs flex items-center space-x-1"
                                title="Catat Servis Bengkel"
                              >
                                <Wrench className="w-3.5 h-3.5 text-accent" />
                                <span className="font-bold">Servis</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCarForTax(comp);
                                  setNewTaxExpiry(comp.taxExpiryDate);
                                  setNewPlateExpiry(comp.plateExpiryDate);
                                }}
                                className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer border border-slate-200 text-xs flex items-center space-x-1"
                                title="Update Pajak STNK"
                              >
                                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="font-bold">Pajak</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIWAYAT SERVIS BENGKEL (SERVICE LOG HISTORY) */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm text-left">
              <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-slate-800">Riwayat Servis & Perawatan Terkini</h3>
                  <span className="text-[10px] text-slate-500 font-sans">Semua catatan perbaikan dan servis berkala armada</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-100/70 text-slate-700 uppercase font-display text-[9px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Armada</th>
                      <th className="p-4">Odometer</th>
                      <th className="p-4">Jenis Servis</th>
                      <th className="p-4">Bengkel Rekanan</th>
                      <th className="p-4">Catatan Perbaikan</th>
                      <th className="p-4 text-right">Biaya (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {maintenanceRecords.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono text-slate-600 font-semibold">{m.serviceDate}</td>
                        <td className="p-4">
                          <strong className="text-slate-900 block">{m.carName}</strong>
                          <span className="font-mono text-[10px] text-slate-500">{m.carPlate}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-700">{m.odometer.toLocaleString("id-ID")} KM</td>
                        <td className="p-4">
                          <span className="font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg text-[10px]">
                            {m.serviceType}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700 font-semibold">{m.workshopName}</td>
                        <td className="p-4 text-slate-600 max-w-xs">{m.notes}</td>
                        <td className="p-4 text-right font-mono font-bold text-red-600" suppressHydrationWarning>
                          {formatCurrency(m.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BUKU KAS & LAPORAN KEUANGAN */}
        {activeTab === "finance" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent font-semibold block">Financial Ledger & Cashflow</span>
                <h2 className="font-display font-black text-2xl md:text-3xl text-slate-800">Buku Kas & Laporan Keuangan</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Pantau arus kas masuk dari penyewaan dan pengeluaran operasional showroom secara transparan.</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportFinanceCSV}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center space-x-2 border border-slate-200 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Unduh Rekap Kas (CSV)</span>
                </button>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-all shadow-md shadow-accent/15 flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Catat Pengeluaran</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 text-left">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 block">Total Pemasukan Sewa</span>
                  <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-display font-black text-xl md:text-2xl text-emerald-700" suppressHydrationWarning>
                  {formatCurrency(dynamicTotalRevenue)}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1 font-sans">Dari DP & pelunasan sewa aktif</span>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 block">Total Pengeluaran</span>
                  <ArrowUpRight className="w-4 h-4 text-red-600" />
                </div>
                <span className="font-display font-black text-xl md:text-2xl text-red-600" suppressHydrationWarning>
                  {formatCurrency(totalOutflow)}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1 font-sans">Servis + Cuci + Driver + Operasional</span>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 block">Laba Bersih Operasional</span>
                  <Wallet className="w-4 h-4 text-accent" />
                </div>
                <span className={`font-display font-black text-xl md:text-2xl ${netProfit >= 0 ? "text-accent" : "text-red-600"}`} suppressHydrationWarning>
                  {formatCurrency(netProfit)}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1 font-sans">Pemasukan dikurangi Pengeluaran</span>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 block">Margin Keuntungan</span>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-display font-black text-2xl text-blue-700">
                  {profitMargin}%
                </span>
                <span className="text-[9px] text-emerald-600 font-sans font-medium block mt-1">Efisiensi Finansial Baik</span>
              </div>
            </div>

            {/* TABEL BUKU KAS & MUTASI KEUANGAN HARIAN */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm text-left">
              <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-slate-800">Mutasi Buku Kas & Arus Keuangan</h3>
                  <span className="text-[10px] text-slate-500 font-sans">Daftar transaksi masuk dan keluar showroom</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-100/70 text-slate-700 uppercase font-display text-[9px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Tipe Mutasi</th>
                      <th className="p-4">Kategori Transaksi</th>
                      <th className="p-4">Keterangan / Rincian</th>
                      <th className="p-4">Unit Terkait</th>
                      <th className="p-4 text-right">Nominal (IDR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Combine Bookings (Inflow), Maintenance (Outflow), and Expenses (Outflow) */}
                    {bookings
                      .filter(b => b.paymentStatus !== "Belum Bayar")
                      .map(b => (
                        <tr key={"in-" + b.id} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="p-4 font-mono text-slate-600 font-semibold">{b.date}</td>
                          <td className="p-4">
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px] flex items-center space-x-1 w-max">
                              <ArrowDownRight className="w-3 h-3 text-emerald-700" />
                              <span>Pemasukan</span>
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-slate-800">Sewa ({b.paymentStatus})</td>
                          <td className="p-4 text-slate-700">Sewa {b.car} oleh {b.client} ({b.durationDays} hari)</td>
                          <td className="p-4 text-slate-600 font-mono text-[11px]">{b.car}</td>
                          <td className="p-4 text-right font-mono font-bold text-emerald-700" suppressHydrationWarning>
                            + {formatCurrency(b.paymentStatus === "Lunas" ? b.totalPrice : b.depositAmount)}
                          </td>
                        </tr>
                      ))}

                    {maintenanceRecords.map(m => (
                      <tr key={"out-m-" + m.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="p-4 font-mono text-slate-600 font-semibold">{m.serviceDate}</td>
                        <td className="p-4">
                          <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md text-[10px] flex items-center space-x-1 w-max">
                            <ArrowUpRight className="w-3 h-3 text-red-700" />
                            <span>Pengeluaran</span>
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-800">Bengkel ({m.serviceType})</td>
                        <td className="p-4 text-slate-700">{m.workshopName} - {m.notes}</td>
                        <td className="p-4 text-slate-600 font-mono text-[11px]">{m.carName} [{m.carPlate}]</td>
                        <td className="p-4 text-right font-mono font-bold text-red-600" suppressHydrationWarning>
                          - {formatCurrency(m.cost)}
                        </td>
                      </tr>
                    ))}

                    {expenseRecords.map(e => (
                      <tr key={"out-e-" + e.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="p-4 font-mono text-slate-600 font-semibold">{e.date}</td>
                        <td className="p-4">
                          <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md text-[10px] flex items-center space-x-1 w-max">
                            <ArrowUpRight className="w-3 h-3 text-red-700" />
                            <span>Pengeluaran</span>
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-800">{e.category}</td>
                        <td className="p-4 text-slate-700">{e.description}</td>
                        <td className="p-4 text-slate-600 font-mono text-[11px]">{e.carName || "Showroom"}</td>
                        <td className="p-4 text-right font-mono font-bold text-red-600" suppressHydrationWarning>
                          - {formatCurrency(e.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FORM OVERLAY MODAL: TAMBAH / EDIT KENDARAAN */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* LEFT SIDE: Inputs Form (7 cols in equivalent grid) */}
            <form onSubmit={handleFormSubmit} className="flex-1 p-6 md:p-8 space-y-5 overflow-y-auto max-h-[70vh] md:max-h-none text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="font-display font-extrabold text-base text-slate-800 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>{editingCar ? "Edit Detail Kendaraan" : "Tambah Kendaraan Baru"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-slate-800 focus:outline-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Mobil */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Nama Mobil</label>
                  <input
                    type="text"
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
                    placeholder="Contoh: Porsche 911 Carrera S"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Kategori */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Kategori</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newCat = prompt("Masukkan nama kategori baru:");
                        if (newCat && newCat.trim()) {
                          const added = handleAddCategory(newCat.trim());
                          if (added) setCarCategory(newCat.trim());
                        }
                      }}
                      className="text-[10px] text-accent hover:underline font-bold cursor-pointer"
                    >
                      + Tambah Kategori
                    </button>
                  </div>
                  <select
                    value={carCategory}
                    onChange={(e) => {
                      if (e.target.value === "__new__") {
                        const newCat = prompt("Masukkan nama kategori baru:");
                        if (newCat && newCat.trim()) {
                          const added = handleAddCategory(newCat.trim());
                          if (added) setCarCategory(newCat.trim());
                        }
                      } else {
                        setCarCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-display text-xs focus:outline-none focus:border-accent"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__new__">+ Tambah Kategori Baru...</option>
                  </select>
                </div>

                {/* Harga per Hari */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Harga Sewa / Hari (IDR)</label>
                  <input
                    type="number"
                    value={carPrice}
                    onChange={(e) => setCarPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Transmisi */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Transmisi</label>
                  <select
                    value={carTransmission}
                    onChange={(e) => setCarTransmission(e.target.value as CarType['transmission'])}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-display text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="Automatic">Automatic (AT)</option>
                    <option value="Manual">Manual (MT)</option>
                    <option value="Dual-Clutch">Dual-Clutch (DCT)</option>
                  </select>
                </div>

                {/* Bahan Bakar */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Bahan Bakar</label>
                  <select
                    value={carFuelType}
                    onChange={(e) => setCarFuelType(e.target.value as CarType['fuelType'])}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-display text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="Pertalite">Pertalite</option>
                    <option value="Pertamax">Pertamax</option>
                    <option value="Pertamax Turbo">Pertamax Turbo</option>
                    <option value="Solar (Biosolar)">Solar (Biosolar)</option>
                    <option value="Dexlite / Pertamina Dex">Dexlite / Pertamina Dex</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                {/* Kursi */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Kapasitas Kursi</label>
                  <input
                    type="number"
                    value={carSeats}
                    onChange={(e) => setCarSeats(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Image Upload & URL */}
                <div className="space-y-3 sm:col-span-2 pt-2 border-t border-slate-200/60">
                  <span className="font-display font-semibold text-[10px] text-slate-500 uppercase tracking-wider block">Foto Kendaraan</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* File Upload Option */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-700 font-bold block mb-1">Upload File Foto</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file, 800, 600, 0.7);
                              setCarImage(compressed);
                            } catch (err) {
                              console.error(err);
                              alert("Gagal memproses gambar mobil.");
                            }
                          }
                        }}
                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-display file:font-bold file:uppercase file:tracking-wider file:bg-accent file:text-white hover:file:bg-accent-hover cursor-pointer w-full"
                      />
                    </div>
                    {/* URL Input Option */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-700 font-bold block mb-1">Atau Masukkan Image URL</label>
                      <input
                        type="text"
                        value={carImage}
                        onChange={(e) => setCarImage(e.target.value)}
                        placeholder="Masukkan link URL gambar..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 text-slate-650 font-display text-[10px] uppercase tracking-widest transition-colors cursor-pointer bg-slate-50 focus:outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-display font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer focus:outline-none"
                >
                  {editingCar ? "Simpan Perubahan" : "Tambah Mobil"}
                </button>
              </div>
            </form>

            {/* RIGHT SIDE: Realtime Visual Card Preview (3 cols in equivalent grid) */}
            <div className="hidden md:flex w-72 bg-slate-50 border-l border-slate-200 p-6 flex-col justify-center items-center relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.015),transparent_60%)] pointer-events-none" />
              
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-4 block">
                Visual Card Preview
              </span>

              {/* Mockup Card replica */}
              <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-lg">
                <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                  <span className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 rounded-md text-[8px] uppercase tracking-widest text-accent border border-slate-200 font-bold">
                    {carCategory}
                  </span>
                  
                  {carImage.trim() ? (
                    <img src={carImage} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-widest font-display">
                      No Image Link
                    </div>
                  )}
                </div>

                <div className="p-4 text-left space-y-3">
                  <div>
                    <span className="font-display font-bold text-sm text-slate-800 block truncate">
                      {carName || "Nama Mobil Baru"}
                    </span>
                    <span className="text-[9px] text-slate-500">Rating: 5.0 (Baru)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500 border-t border-b border-slate-100 py-2 font-sans">
                    <span>👥 {carSeats} Seats</span>
                    <span className="text-right">⚙️ {carTransmission === "Dual-Clutch" ? "DCT" : carTransmission === "Automatic" ? "AT" : "MT"}</span>
                  </div>

                  <div className="flex items-end justify-between pt-1">
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-slate-400 block font-semibold">Mulai Dari</span>
                      <span className="font-display font-black text-xs text-accent">
                        {formatCurrency(carPrice)}
                      </span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 text-[8px] px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                      Tersedia
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 leading-normal mt-6 max-w-[200px] text-center font-sans">
                Pratinjau visual card di atas diperbarui secara realtime seiring perubahan data form di sebelah kiri.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FORM OVERLAY MODAL: TAMBAH / EDIT TESTIMONI */}
      {isTestimonialFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* LEFT SIDE: Inputs Form (7 cols in equivalent grid) */}
            <form onSubmit={handleTestimonialFormSubmit} className="flex-1 p-6 md:p-8 space-y-5 overflow-y-auto max-h-[70vh] md:max-h-none text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="font-display font-extrabold text-base text-slate-800 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>{editingTestimonial ? "Edit Ulasan Pelanggan" : "Tambah Ulasan Baru"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsTestimonialFormOpen(false)}
                  className="text-slate-500 hover:text-slate-700 focus:outline-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Pelanggan */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Nama Pelanggan</label>
                  <input
                    type="text"
                    value={testimonialName}
                    onChange={(e) => setTestimonialName(e.target.value)}
                    placeholder="Contoh: Alexander Graham"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Jabatan / Pekerjaan */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Jabatan / Pekerjaan</label>
                  <input
                    type="text"
                    value={testimonialRole}
                    onChange={(e) => setTestimonialRole(e.target.value)}
                    placeholder="Contoh: CEO, Capital Group"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Rating Bintang */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Rating Bintang</label>
                  <select
                    value={testimonialRating}
                    onChange={(e) => setTestimonialRating(parseInt(e.target.value) || 5)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-display text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
                    <option value="3">⭐⭐⭐ (3 Bintang)</option>
                    <option value="2">⭐⭐ (2 Bintang)</option>
                    <option value="1">⭐ (1 Bintang)</option>
                  </select>
                </div>

                {/* Ulasan */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Isi Ulasan Pelanggan</label>
                  <textarea
                    value={testimonialText}
                    onChange={(e) => setTestimonialText(e.target.value)}
                    placeholder="Tuliskan ulasan pelanggan secara detail di sini..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent h-24 resize-none"
                    required
                  />
                </div>

                {/* Avatar Uploader & URL */}
                <div className="space-y-3 sm:col-span-2 pt-2 border-t border-slate-200/60">
                  <span className="font-display font-semibold text-[10px] text-slate-500 uppercase tracking-wider block">Foto Profil Pelanggan (Avatar)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-700 font-bold block mb-1">Upload File Foto</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file, 200, 200, 0.7);
                              setTestimonialAvatar(compressed);
                            } catch (err) {
                              console.error(err);
                              alert("Gagal memproses avatar.");
                            }
                          }
                        }}
                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-display file:font-bold file:uppercase file:tracking-wider file:bg-accent file:text-white hover:file:bg-accent-hover cursor-pointer w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-700 font-bold block mb-1">Atau Image URL</label>
                      <input
                        type="text"
                        value={testimonialAvatar}
                        onChange={(e) => setTestimonialAvatar(e.target.value)}
                        placeholder="Masukkan link URL foto profil..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Video Review settings */}
                <div className="space-y-3 sm:col-span-2 pt-2 border-t border-slate-200/60">
                  <span className="font-display font-semibold text-[10px] text-slate-500 uppercase tracking-wider block">Ulasan Video Review (Opsional)</span>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Link Video (YouTube Embed/MP4 Link)</label>
                    <input
                      type="text"
                      value={testimonialVideoUrl}
                      onChange={(e) => setTestimonialVideoUrl(e.target.value)}
                      placeholder="Contoh: https://www.youtube.com/embed/dQw4w9WgXcQ"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-700 font-bold block mb-1">Upload Cover Video (Thumbnail)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file, 800, 500, 0.7);
                              setTestimonialVideoThumb(compressed);
                            } catch (err) {
                              console.error(err);
                              alert("Gagal memproses cover video.");
                            }
                          }
                        }}
                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-display file:font-bold file:uppercase file:tracking-wider file:bg-accent file:text-white hover:file:bg-accent-hover cursor-pointer w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-700 font-bold block mb-1">Atau Cover URL</label>
                      <input
                        type="text"
                        value={testimonialVideoThumb}
                        onChange={(e) => setTestimonialVideoThumb(e.target.value)}
                        placeholder="Masukkan link URL cover video..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTestimonialFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 text-slate-650 font-display text-[10px] uppercase tracking-widest transition-colors cursor-pointer bg-slate-50 focus:outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-display font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer focus:outline-none"
                >
                  {editingTestimonial ? "Simpan Perubahan" : "Terbitkan Ulasan"}
                </button>
              </div>
            </form>

            {/* RIGHT SIDE: Realtime Visual Preview */}
            <div className="hidden md:flex w-72 bg-slate-50 border-l border-slate-200 p-6 flex-col justify-center items-center relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.015),transparent_60%)] pointer-events-none" />
              
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-4 block">
                Visual Review Preview
              </span>

              {/* Mockup Card replica */}
              <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-lg text-left p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <img src={testimonialAvatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                  <div>
                    <h5 className="font-display font-bold text-[10px] text-slate-800 line-clamp-1">{testimonialName || "Nama Pelanggan"}</h5>
                    <span className="text-[8px] text-slate-400 block">{testimonialRole || "Pekerjaan"}</span>
                  </div>
                </div>
                <p className="text-slate-500 font-sans italic text-[9px] leading-relaxed line-clamp-3">
                  &ldquo;{testimonialText || "Ulasan pelanggan akan tertera di sini..."}&rdquo;
                </p>
                {testimonialVideoThumb.trim() ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200 mt-2">
                    <img src={testimonialVideoThumb} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <span className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">▶</span>
                    </div>
                  </div>
                ) : testimonialVideoUrl.trim() ? (
                  <div className="text-[8px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-center mt-2">
                    Video URL aktif (Tanpa Cover Kustom)
                  </div>
                ) : null}
              </div>

              <div className="text-[9px] text-slate-500 leading-normal mt-6 max-w-[200px] text-center font-sans">
                Pratinjau ulasan di atas diperbarui secara realtime seiring perubahan form di sebelah kiri.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FORM OVERLAY MODAL: TAMBAH / EDIT BLOG / ARTIKEL */}
      {isBlogFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            
            {/* LEFT SIDE: Inputs Form (7 cols in equivalent grid) */}
            <form onSubmit={handleBlogFormSubmit} className="flex-1 p-6 md:p-8 space-y-5 overflow-y-auto max-h-[70vh] md:max-h-none text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="font-display font-extrabold text-base text-slate-800 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>{editingBlogPost ? "Edit Artikel Jurnal" : "Tulis Artikel Baru"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsBlogFormOpen(false)}
                  className="text-slate-500 hover:text-slate-700 focus:outline-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Judul */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Judul Artikel</label>
                  <input
                    type="text"
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    placeholder="Masukkan judul artikel..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Kategori */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Kategori</label>
                  <select
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value as BlogPost['category'])}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-display text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="Tips">Tips</option>
                    <option value="Wisata">Wisata</option>
                    <option value="Otomotif">Otomotif</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>

                {/* Tanggal Terbit */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Tanggal Terbit</label>
                  <input
                    type="text"
                    value={blogDate}
                    onChange={(e) => setBlogDate(e.target.value)}
                    placeholder="Contoh: 26 Agustus 2026"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                {/* Ringkasan Snippet */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase tracking-widest text-slate-700 font-semibold">Ringkasan Artikel (Snippet)</label>
                  <textarea
                    value={blogSnippet}
                    onChange={(e) => setBlogSnippet(e.target.value)}
                    placeholder="Tuliskan 1-2 kalimat ringkasan artikel..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent h-20 resize-none"
                    required
                  />
                </div>

                {/* Image Upload & URL */}
                <div className="space-y-3 sm:col-span-2 pt-2 border-t border-slate-200/60">
                  <span className="font-display font-semibold text-[10px] text-slate-500 uppercase tracking-wider block">Gambar Artikel</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* File Upload Option */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-700 font-bold block mb-1">Upload File Foto</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file, 800, 500, 0.7);
                              setBlogImage(compressed);
                            } catch (err) {
                              console.error(err);
                              alert("Gagal memproses gambar artikel.");
                            }
                          }
                        }}
                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-display file:font-bold file:uppercase file:tracking-wider file:bg-accent file:text-white hover:file:bg-accent-hover cursor-pointer w-full"
                      />
                    </div>
                    {/* URL Input Option */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-slate-700 font-bold block mb-1">Atau Masukkan Image URL</label>
                      <input
                        type="text"
                        value={blogImage}
                        onChange={(e) => setBlogImage(e.target.value)}
                        placeholder="Masukkan link URL gambar..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl font-sans text-xs focus:outline-none focus:border-accent placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBlogFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 text-slate-650 font-display text-[10px] uppercase tracking-widest transition-colors cursor-pointer bg-slate-50 focus:outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-display font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer focus:outline-none"
                >
                  {editingBlogPost ? "Simpan Perubahan" : "Terbitkan Artikel"}
                </button>
              </div>
            </form>

            {/* RIGHT SIDE: Realtime Visual Card Preview (3 cols in equivalent grid) */}
            <div className="hidden md:flex w-72 bg-slate-50 border-l border-slate-200 p-6 flex-col justify-center items-center relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.015),transparent_60%)] pointer-events-none" />
              
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-4 block">
                Visual Article Preview
              </span>

              {/* Mockup Card replica */}
              <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-lg">
                <div className="aspect-[16/10] w-full bg-slate-100 overflow-hidden relative">
                  <span className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 rounded-md text-[8px] uppercase tracking-widest text-accent border border-slate-200 font-bold">
                    {blogCategory}
                  </span>
                  
                  {blogImage.trim() ? (
                    <img src={blogImage} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-widest font-display">
                      No Image Link
                    </div>
                  )}
                </div>

                <div className="p-4 text-left space-y-2">
                  <span className="text-[8px] text-slate-400 block font-sans">{blogDate || "26 Agustus 2026"}</span>
                  <h4 className="font-display font-bold text-xs text-slate-800 block truncate">
                    {blogTitle || "Judul Artikel Baru"}
                  </h4>
                  <p className="font-sans font-light text-slate-500 text-[9px] leading-relaxed line-clamp-2">
                    {blogSnippet || "Tuliskan ringkasan menarik di sini..."}
                  </p>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 leading-normal mt-6 max-w-[200px] text-center font-sans">
                Pratinjau artikel di atas diperbarui secara realtime seiring perubahan form di sebelah kiri.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: PUSAT VERIFIKASI DOKUMEN & KTP PENYEWA */}
      {/* ======================================================== */}
      {selectedVerificationBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-800">
                    Pusat Verifikasi Dokumen & Anti-Penggelapan
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    ID Reservasi: <span className="font-bold text-accent">{selectedVerificationBooking.id}</span> • {selectedVerificationBooking.client}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVerificationBooking(null)}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>



            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
              {/* Kolom Kiri: Pratinjau Dokumen KTP & SIM A */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Foto KTP Asli Penyewa</span>
                    <span className="text-[10px] text-slate-400 font-mono">NIK: {selectedVerificationBooking.documents.ktpNumber}</span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10] shadow-sm group">
                    <img
                      src={selectedVerificationBooking.documents.ktpUrl}
                      alt="KTP"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                      <div className="rotate-[-12deg] border-2 border-dashed border-white/90 bg-red-600/85 text-white font-bold text-[10px] sm:text-xs uppercase px-4 py-1.5 rounded-lg shadow-xl tracking-wider">
                        KHUSUS SEWA ROYAL DRIVE • {selectedVerificationBooking.id}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Foto SIM A Penyewa</span>
                    <span className="text-[10px] text-slate-400 font-mono">No. SIM: {selectedVerificationBooking.documents.simNumber}</span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10] shadow-sm group">
                    <img
                      src={selectedVerificationBooking.documents.simUrl}
                      alt="SIM A"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                      <div className="rotate-[-12deg] border-2 border-dashed border-white/90 bg-blue-600/85 text-white font-bold text-[10px] sm:text-xs uppercase px-4 py-1.5 rounded-lg shadow-xl tracking-wider">
                        SIM TERVALIDASI • ROYAL DRIVE
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bukti Pembayaran DP */}
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bukti Pembayaran Uang Muka (DP)</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedVerificationBooking.paymentProofUrl
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {selectedVerificationBooking.paymentProofUrl ? "✓ Bukti Terlampir" : "Belum Unggah Bukti"}
                    </span>
                  </div>

                  {selectedVerificationBooking.paymentProofUrl ? (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white shadow-xs">
                        <img
                          src={selectedVerificationBooking.paymentProofUrl}
                          alt="Bukti Transfer DP"
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setSelectedProofBooking(selectedVerificationBooking)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-800 block">Struk Transfer m-Banking</span>
                        <span className="text-[11px] text-emerald-700 font-mono font-bold block">
                          Tagihan DP: {formatCurrency(selectedVerificationBooking.depositAmount)}
                        </span>
                        {selectedVerificationBooking.paymentProofTime && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Waktu: {selectedVerificationBooking.paymentProofTime}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedProofBooking(selectedVerificationBooking)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-sm"
                      >
                        Lihat Penuh
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        <span className="font-semibold block text-slate-700">Penyewa Belum Mengunggah Struk DP</span>
                        <span className="text-[11px] text-slate-400 block">
                          Nominal DP: {formatCurrency(selectedVerificationBooking.depositAmount)} • Status: {selectedVerificationBooking.paymentStatus}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedProofBooking(selectedVerificationBooking)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                      >
                        Upload / Kelola
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Rincian Kontak & Validasi */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
                    Data Penjamin & Profil Penyewa
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Nama Lengkap</span>
                      <span className="font-bold text-slate-800">{selectedVerificationBooking.client}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Nomor WhatsApp</span>
                      <span className="font-bold text-slate-800 font-mono">{selectedVerificationBooking.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Email</span>
                      <span className="font-medium text-slate-600">{selectedVerificationBooking.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Akun Media Sosial / Profil</span>
                      <span className="font-bold text-blue-600">{selectedVerificationBooking.documents.socialMedia}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-2 text-xs">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                      Kontak Darurat / Penjamin
                    </span>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nama:</span>
                        <span className="font-bold text-slate-800">{selectedVerificationBooking.documents.emergencyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hubungan:</span>
                        <span className="font-semibold text-slate-700">{selectedVerificationBooking.documents.emergencyRelation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">No. Telepon:</span>
                        <span className="font-mono font-bold text-slate-800">{selectedVerificationBooking.documents.emergencyPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 block mb-1">Status Verifikasi</span>
                    {selectedVerificationBooking.documents.verified ? (
                      <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Dokumen Resmi Terverifikasi</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2 rounded-xl text-xs font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Menunggu Konfirmasi Admin</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {!selectedVerificationBooking.documents.verified && (
                    <button
                      onClick={() => handleVerifyDocuments(selectedVerificationBooking.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui & Tandai KTP Valid</span>
                    </button>
                  )}
                  <a
                    href={`https://wa.me/${selectedVerificationBooking.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Halo Bpk/Ibu ${selectedVerificationBooking.client}, kami dari Tim Verifikasi ${brandName}. Mohon konfirmasi mengenai kelengkapan berkas sewa Anda untuk unit ${selectedVerificationBooking.car}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 font-display font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Hubungi Penyewa via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CETAK INVOICE & KUITANSI PEMBAYARAN RESMI */}
      {/* ======================================================== */}
      {selectedInvoiceBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 print:hidden">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-accent" />
                <span className="font-display font-bold text-sm text-slate-800">Dokumen Pembayaran Resmi</span>
              </div>
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setInvoiceDocType("invoice")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      invoiceDocType === "invoice" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Faktur / Invoice
                  </button>
                  <button
                    onClick={() => setInvoiceDocType("kwitansi")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      invoiceDocType === "kwitansi" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Kwitansi Kasir Lunas
                  </button>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-accent/20 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceBooking(null)}
                  className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Area Kertas Dokumen Siap Cetak */}
            <div className="p-8 sm:p-12 overflow-y-auto text-left text-slate-800 font-sans space-y-8 bg-white">
              {invoiceDocType === "invoice" ? (
                <>
                  {/* Kop Invoice */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-800 pb-6 gap-4">
                    <div>
                      <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight">{brandName}</h2>
                      <p className="text-xs text-slate-500 font-sans">Premium & Luxury Car Rental Service</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs">{showroomAddress}</p>
                      <p className="text-[11px] text-slate-400">Telp / WA: {whatsappNumber} • Email: {contactEmail}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="font-display font-black text-xl text-accent block">INVOICE SEWA</span>
                      <span className="font-mono text-xs text-slate-600 block">No: INV/2026/{selectedInvoiceBooking.id}</span>
                      <span className="text-[11px] text-slate-500 block">Tanggal: {selectedInvoiceBooking.date}</span>
                    </div>
                  </div>

                  {/* Data Penyewa & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Ditagihkan Kepada:</span>
                      <h4 className="font-bold text-sm text-slate-900">{selectedInvoiceBooking.client}</h4>
                      <p className="text-xs text-slate-600">WhatsApp: {selectedInvoiceBooking.phone}</p>
                      <p className="text-xs text-slate-600">Email: {selectedInvoiceBooking.email}</p>
                      <p className="text-xs text-slate-500 mt-1">Lokasi Jemput: {selectedInvoiceBooking.pickupLocation || "Pool Showroom"}</p>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Status Pembayaran:</span>
                      <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${
                        selectedInvoiceBooking.paymentStatus === "Lunas"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-blue-50 text-blue-700 border-blue-300"
                      }`}>
                        {selectedInvoiceBooking.paymentStatus}
                      </span>
                      <p className="text-xs text-slate-500 mt-2">Periode: {selectedInvoiceBooking.startDate} s/d {selectedInvoiceBooking.endDate}</p>
                      <p className="text-xs font-bold text-slate-700">Durasi: {selectedInvoiceBooking.durationDays} Hari Sewa</p>
                    </div>
                  </div>

                  {/* Tabel Rincian Biaya */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 uppercase font-display text-[9px] tracking-wider">
                        <tr>
                          <th className="p-3">Deskripsi Item Layanan</th>
                          <th className="p-3 text-center">Durasi</th>
                          <th className="p-3 text-right">Tarif / Hari</th>
                          <th className="p-3 text-right">Jumlah</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        <tr>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{selectedInvoiceBooking.car}</span>
                            <span className="text-[10px] text-slate-500">Plat Nomor: {selectedInvoiceBooking.carPlate} • Layanan {selectedInvoiceBooking.rentalType}</span>
                          </td>
                          <td className="p-3 text-center font-semibold">{selectedInvoiceBooking.durationDays} Hari</td>
                          <td className="p-3 text-right" suppressHydrationWarning>{formatCurrency(Math.round(selectedInvoiceBooking.totalPrice / selectedInvoiceBooking.durationDays))}</td>
                          <td className="p-3 text-right font-bold text-slate-900" suppressHydrationWarning>{formatCurrency(selectedInvoiceBooking.totalPrice)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Rincian Total, DP & Sisa Pelunasan */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pt-2 gap-4">
                    <div className="text-xs space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-sm">
                      <span className="font-bold text-slate-700 block">Metode Pembayaran Resmi:</span>
                      <p className="text-[11px] text-slate-600 font-mono">BCA: 8820-1928-33 a.n {brandName}</p>
                      <p className="text-[11px] text-slate-600 font-mono">Mandiri: 132-00-9829-11 a.n {brandName}</p>
                      <p className="text-[10px] text-slate-400 mt-2 italic">*Harap cantumkan No. Invoice pada berita transfer.</p>
                    </div>

                    <div className="w-full sm:w-64 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span suppressHydrationWarning>{formatCurrency(selectedInvoiceBooking.totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Uang Muka (DP):</span>
                        <span suppressHydrationWarning>- {formatCurrency(selectedInvoiceBooking.depositAmount)}</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-accent pt-2 border-t-2 border-slate-800">
                        <span>Sisa Tagihan:</span>
                        <span suppressHydrationWarning>
                          {formatCurrency(Math.max(0, selectedInvoiceBooking.totalPrice - selectedInvoiceBooking.depositAmount))}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* FORMAT KWITANSI PELUNASAN RESMI KASIR */
                <div className="space-y-6">
                  {/* KOP KWITANSI */}
                  <div className="text-center border-b-2 border-slate-900 pb-4">
                    <h2 className="font-display font-black text-2xl text-slate-900 uppercase tracking-widest">{brandName || "ROYAL DRIVE"}</h2>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Kuitansi Resmi Pembayaran Sewa Mobil &bull; Layanan Terpercaya</span>
                    <span className="text-[10px] text-slate-400 block">{showroomAddress} &bull; Hotline: {contactPhone || whatsappNumber}</span>
                  </div>

                  {/* JUDUL KWITANSI */}
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-300">
                    <div className="bg-slate-900 text-white font-display font-black text-xs uppercase px-4 py-1.5 rounded-lg tracking-widest">
                      KWITANSI PEMBAYARAN
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">NO. KWITANSI</span>
                      <span className="font-mono font-bold text-sm text-slate-900">KW/RD/{new Date().getFullYear()}/{selectedInvoiceBooking.id}</span>
                    </div>
                  </div>

                  {/* FORMULIR KWITANSI INDONESIA */}
                  <div className="space-y-4 py-2 text-xs font-sans text-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="w-48 font-bold text-slate-600 uppercase text-[11px] shrink-0">Telah Terima Dari:</span>
                      <span className="flex-1 font-bold text-sm text-slate-900 border-b border-dotted border-slate-400 pb-1">{selectedInvoiceBooking.client}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="w-48 font-bold text-slate-600 uppercase text-[11px] shrink-0">Uang Sejumlah:</span>
                      <div className="flex-1 bg-amber-50/80 border border-amber-200 text-amber-950 font-serif italic text-xs p-3 rounded-xl font-bold">
                        # {terbilangRupiah(selectedInvoiceBooking.totalPrice)} #
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="w-48 font-bold text-slate-600 uppercase text-[11px] shrink-0">Untuk Pembayaran:</span>
                      <span className="flex-1 text-slate-800 border-b border-dotted border-slate-400 pb-1 leading-relaxed">
                        Pelunasan Sewa Mobil <strong>{selectedInvoiceBooking.car}</strong> [{selectedInvoiceBooking.carPlate}] &bull; Periode sewa <strong>{selectedInvoiceBooking.startDate}</strong> s/d <strong>{selectedInvoiceBooking.endDate}</strong> ({selectedInvoiceBooking.durationDays} Hari).
                      </span>
                    </div>
                  </div>

                  {/* KOTAK NOMINAL & STEMPEL LUNAS */}
                  <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-6">
                    <div className="flex items-center space-x-4">
                      <div className="border-2 border-slate-900 bg-slate-50 px-6 py-3 rounded-2xl">
                        <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">JUMLAH TERBILANG</span>
                        <span className="font-mono font-black text-xl text-slate-900" suppressHydrationWarning>
                          {formatCurrency(selectedInvoiceBooking.totalPrice)}
                        </span>
                      </div>

                      {/* STEMPEL CAP LUNAS */}
                      <div className="border-4 border-emerald-600 text-emerald-600 font-display font-black text-base uppercase px-4 py-2 rounded-xl rotate-[-8deg] tracking-widest opacity-85 shadow-sm">
                        ✓ LUNAS
                      </div>
                    </div>

                    {/* TANDA TANGAN KASIR */}
                    <div className="text-center text-xs min-w-[200px]">
                      <span className="text-slate-500 block">Jakarta, {selectedInvoiceBooking.date}</span>
                      <span className="text-slate-500 block mb-12">Kasir / Bagian Keuangan,</span>
                      <div className="border-b border-slate-800 w-44 mx-auto" />
                      <span className="text-slate-800 font-bold block mt-1">( {brandName || "Royal Drive"} Finance )</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CETAK SURAT PERJANJIAN SEWA MENYEWA (SPK / SPSM) */}
      {/* ======================================================== */}
      {selectedContractBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
              <div className="flex items-center space-x-2">
                <FileSignature className="w-5 h-5 text-purple-600" />
                <span className="font-display font-bold text-sm text-slate-800">Surat Perjanjian Sewa Menyewa Mobil (SPSM)</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen SPK</span>
                </button>
                <button
                  onClick={() => setSelectedContractBooking(null)}
                  className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Format Dokumen Hukum Resmi */}
            <div className="p-8 sm:p-12 overflow-y-auto text-left text-slate-800 font-serif space-y-6 leading-relaxed bg-white">
              {/* Header Surat Perjanjian */}
              <div className="text-center border-b-2 border-slate-800 pb-4">
                <h2 className="font-sans font-black text-xl uppercase tracking-wider text-slate-900">{brandName} CAR RENTAL</h2>
                <h3 className="font-sans font-extrabold text-sm uppercase tracking-wide text-slate-700 mt-1">SURAT PERJANJIAN SEWA MENYEWA KENDARAAN (SPSM)</h3>
                <p className="font-mono text-[11px] text-slate-500 mt-1">Nomor Dokumen: SPK/RD/{new Date().getFullYear()}/{selectedContractBooking.id}</p>
              </div>

              <p className="text-xs text-justify">
                Pada hari ini, tanggal <strong>{selectedContractBooking.date}</strong>, telah dibuat dan ditandatangani perjanjian sewa menyewa kendaraan antara pihak-pihak sebagai berikut:
              </p>

              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans">
                <div>
                  <strong className="block text-slate-900">1. PIHAK PERTAMA (Pemberi Sewa):</strong>
                  <p className="text-slate-600">{brandName} Car Rental Indonesia, berkedudukan di {showroomAddress}, bertindak sebagai pengelola dan pemilik sah armada kendaraan.</p>
                </div>
                <div>
                  <strong className="block text-slate-900">2. PIHAK KEDUA (Penyewa):</strong>
                  <p className="text-slate-600">Nama: <strong>{selectedContractBooking.client}</strong> | NIK KTP: <strong>{selectedContractBooking.documents.ktpNumber}</strong> | No. SIM: <strong>{selectedContractBooking.documents.simNumber}</strong> | No. HP: <strong>{selectedContractBooking.phone}</strong>.</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-sans font-bold text-slate-900 uppercase">Pasal 1: Objek dan Biaya Sewa</h4>
                  <p className="text-slate-700 text-justify">
                    PIHAK PERTAMA menyewakan kepada PIHAK KEDUA 1 (satu) unit kendaraan <strong>{selectedContractBooking.car}</strong> dengan Nomor Polisi <strong>{selectedContractBooking.carPlate}</strong> selama <strong>{selectedContractBooking.durationDays} hari</strong> ({selectedContractBooking.startDate} s/d {selectedContractBooking.endDate}) dengan total nilai sewa <strong>{formatCurrency(selectedContractBooking.totalPrice)}</strong>.
                  </p>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-slate-900 uppercase">Pasal 2: Tanggung Jawab Keamanan & Kerusakan</h4>
                  <p className="text-slate-700 text-justify">
                    PIHAK KEDUA bertanggung jawab penuh menjaga keutuhan kendaraan. Segala kerusakan lecet bodi, pecah kaca, atau kehilangan perlengkapan selama masa sewa menjadi beban PIHAK KEDUA sesuai klaim asuransi per kejadian dan biaya perbaikan riil bengkel rekanan.
                  </p>
                </div>

                <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded-r-xl">
                  <h4 className="font-sans font-bold text-red-900 uppercase">Pasal 3: Larangan Penggadaian & Sanksi Pidana</h4>
                  <p className="text-red-800 text-justify font-sans text-[11px]">
                    KENDARAAN DILENGKAPI SISTEM GPS TRACKER REALTIME 24 JAM. PIHAK KEDUA DILARANG KERAS memindahtangankan, menyewakan kembali, atau MENGGADAIKAN kendaraan. Segala bentuk penggelapan akan langsung diproses secara HUKUM PIDANA berdasarkan <strong>Pasal 372 dan Pasal 378 KUHP</strong>.
                  </p>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-slate-900 uppercase">Pasal 4: Tilang Elektronik (ETLE) & Denda Keterlambatan</h4>
                  <p className="text-slate-700 text-justify">
                    Pelanggaran tilang elektronik (ETLE) selama periode sewa sepenuhnya merupakan beban PIHAK KEDUA. Keterlambatan pengembalian unit dikenakan denda overcharge sebesar Rp 150.000,- per jam keterlambatan.
                  </p>
                </div>
              </div>

              {/* Tempat Tanda Tangan */}
              <div className="grid grid-cols-2 gap-8 pt-8 font-sans text-xs text-center border-t border-slate-200">
                <div className="space-y-16">
                  <span className="block font-bold text-slate-800">PIHAK PERTAMA (Rental)</span>
                  <div className="border-b border-slate-400 w-40 mx-auto" />
                  <span className="block text-slate-600">Manajemen {brandName}</span>
                </div>
                <div className="space-y-16">
                  <span className="block font-bold text-slate-800">PIHAK KEDUA (Penyewa)</span>
                  <div className="border-b border-slate-400 w-40 mx-auto" />
                  <span className="block text-slate-600">{selectedContractBooking.client}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: CHECKLIST INSPEKSI SERAH-TERIMA DIGITAL */}
      {/* ======================================================== */}
      {selectedInspectionBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-6">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-800">
                    Formulir Serah Terima Kendaraan Digital
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    {selectedInspectionBooking.car} ({selectedInspectionBooking.carPlate}) • {selectedInspectionBooking.client}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInspectionBooking(null)}
                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Selector: Check-out vs Check-in */}
            <div className="flex border-b border-slate-200 bg-slate-100/60 p-2 gap-2 text-xs font-bold">
              <button
                onClick={() => setInspectionTab("checkout")}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  inspectionTab === "checkout"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                1. Serah Terima Keluar (Check-out)
              </button>
              <button
                onClick={() => setInspectionTab("checkin")}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  inspectionTab === "checkin"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                2. Pemeriksaan Masuk (Check-in)
              </button>
            </div>

            <div className="p-6 text-left space-y-5 text-xs font-sans">
              {inspectionTab === "checkout" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Angka Odometer / KM Awal</label>
                      <input
                        type="number"
                        value={inspOdometer}
                        onChange={(e) => setInspOdometer(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl font-mono text-sm focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Level Bahan Bakar Awal</label>
                      <select
                        value={inspFuel}
                        onChange={(e) => setInspFuel(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-accent"
                      >
                        <option value="Full">Full (Penuh 100%)</option>
                        <option value="3/4">3/4 Tangki</option>
                        <option value="1/2">1/2 Tangki</option>
                        <option value="1/4">1/4 Tangki</option>
                        <option value="E">E (Garis Merah)</option>
                      </select>
                    </div>
                  </div>

                  {/* Checklist Kelengkapan Surat & Alat */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600 block">Checklist Kelengkapan Armada</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["STNK Asli", "Kunci Kontak", "Ban Serep", "Dongkrak", "Kotak P3K", "E-Toll"].map((item) => {
                        const checked = inspItems.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              if (checked) {
                                setInspItems(inspItems.filter(i => i !== item));
                              } else {
                                setInspItems([...inspItems, item]);
                              }
                            }}
                            className={`flex items-center space-x-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                              checked
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
                                : "bg-slate-50 text-slate-500 border-slate-200"
                            }`}
                          >
                            {checked ? <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                            <span>{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Catatan Bodi Awal (Lecet / Goresan Bawaan)</label>
                    <textarea
                      rows={2}
                      value={inspScratches}
                      onChange={(e) => setInspScratches(e.target.value)}
                      placeholder="Contoh: Baret halus 2cm di bemper kiri bawah. Lainnya mulus bersih."
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Nama Petugas Penyerah</label>
                    <input
                      type="text"
                      value={inspInspector}
                      onChange={(e) => setInspInspector(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  <button
                    onClick={handleSaveCheckOutInspection}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    Simpan Inspeksi Keluar (Check-out)
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">KM Pengembalian (Akhir)</label>
                      <input
                        type="number"
                        value={inspOdometer}
                        onChange={(e) => setInspOdometer(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl font-mono text-sm focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Level BBM Pengembalian</label>
                      <select
                        value={inspFuel}
                        onChange={(e) => setInspFuel(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-accent"
                      >
                        <option value="Full">Full (Penuh 100%)</option>
                        <option value="3/4">3/4 Tangki</option>
                        <option value="1/2">1/2 Tangki</option>
                        <option value="1/4">1/4 Tangki</option>
                        <option value="E">E (Garis Merah)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Pemeriksaan Kerusakan Baru / Keluhan</label>
                    <textarea
                      rows={2}
                      value={inspNewDamages}
                      onChange={(e) => setInspNewDamages(e.target.value)}
                      placeholder="Contoh: Tidak ada baret baru. Mobil kembali dalam kondisi prima."
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Overtime Calculator */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Kalkulator Overtime / Keterlambatan Jam-Jaman</span>
                      </span>
                      <span className="text-[10px] text-amber-750 font-medium">
                        Tarif: {formatCurrency(settings.lateFeePerHour)} / jam
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          value={inspOvertimeHours}
                          onChange={(e) => {
                            const hours = Math.max(0, Number(e.target.value));
                            setInspOvertimeHours(hours);
                            const overtimeCost = hours * settings.lateFeePerHour;
                            setInspExtraFee(overtimeCost);
                          }}
                          placeholder="0 Jam"
                          className="w-full bg-white border border-amber-300 px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <span className="text-xs text-amber-800 font-medium">Jam Terlambat</span>
                      <div className="text-right pl-2">
                        <span className="text-[9px] text-amber-700 block">Denda Overtime:</span>
                        <span className="font-mono text-xs font-extrabold text-amber-950">
                          {formatCurrency(inspOvertimeHours * settings.lateFeePerHour)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Total Denda / Biaya Tambahan (Bensin/Kerusakan/Overtime)</label>
                    <input
                      type="number"
                      value={inspExtraFee}
                      onChange={(e) => setInspExtraFee(Number(e.target.value))}
                      placeholder="Rp 0"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl font-mono text-sm text-red-600 font-bold focus:outline-none focus:border-accent"
                    />
                  </div>

                  <button
                    onClick={handleSaveCheckInInspection}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    Simpan & Tandai Pesanan Selesai (Check-in)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW & VERIFIKASI BUKTI TRANSFER DP */}
      {selectedProofBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-left my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                    Validasi Mutasi Bank
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-slate-800">
                    Bukti Transfer Pembayaran DP ({selectedProofBooking.id})
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedProofBooking(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Summary info */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Penyewa</span>
                  <strong className="text-slate-800">{selectedProofBooking.client}</strong>
                  <span className="text-[10px] text-slate-500 block">{selectedProofBooking.phone}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Mobil: {selectedProofBooking.car}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Tagihan DP</span>
                  <strong className="text-emerald-700 font-mono text-sm block">
                    {formatCurrency(selectedProofBooking.depositAmount)}
                  </strong>
                  <span className="text-[10px] text-slate-400">Total: {formatCurrency(selectedProofBooking.totalPrice)}</span>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                      selectedProofBooking.paymentStatus === "DP Lunas" || selectedProofBooking.paymentStatus === "Lunas"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}>
                      Status: {selectedProofBooking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Image Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Foto Struk / Tangkapan Layar m-Banking:
                  </span>
                  {selectedProofBooking.paymentProofTime && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Diunggah: {selectedProofBooking.paymentProofTime}
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-900/5 p-2 flex items-center justify-center">
                  {selectedProofBooking.paymentProofUrl ? (
                    <img
                      src={selectedProofBooking.paymentProofUrl}
                      alt="Bukti Transfer"
                      className="max-h-72 w-auto object-contain rounded-xl shadow-sm"
                    />
                  ) : (
                    <div className="py-10 px-4 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <p className="text-slate-600 font-semibold text-xs">Penyewa Belum Mengunggah Bukti DP</p>
                      <p className="text-slate-400 text-[11px] max-w-xs mx-auto">
                        Jika penyewa mengirim bukti transfer lewat chat WhatsApp atau email, Anda dapat mengunggahnya langsung di bawah ini.
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload or Replace Struk Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label className="flex-1 min-w-[160px] flex items-center justify-center space-x-1.5 py-2 px-3 border border-dashed border-emerald-400 hover:border-emerald-600 rounded-xl bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold cursor-pointer transition-colors text-center shadow-2xs">
                    <Upload className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                    <span>{selectedProofBooking.paymentProofUrl ? "Ganti / Upload Ulang Struk" : "Upload Struk Manual (WA)"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (readerEvent) => {
                            const img = new window.Image();
                            img.onload = () => {
                              const canvas = document.createElement("canvas");
                              let width = img.width;
                              let height = img.height;
                              const maxDim = 1000;
                              if (width > maxDim || height > maxDim) {
                                if (width > height) {
                                  height = Math.round((height * maxDim) / width);
                                  width = maxDim;
                                } else {
                                  width = Math.round((width * maxDim) / height);
                                  height = maxDim;
                                }
                              }
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext("2d");
                              ctx?.drawImage(img, 0, 0, width, height);
                              const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
                              const timeStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
                              const updated = bookings.map(b => b.id === selectedProofBooking.id ? { ...b, paymentProofUrl: dataUrl, paymentProofTime: timeStr } : b);
                              updateAndSaveBookings(updated);
                              setSelectedProofBooking({ ...selectedProofBooking, paymentProofUrl: dataUrl, paymentProofTime: timeStr });
                              setToastMessage(`Bukti transfer untuk ${selectedProofBooking.id} berhasil disimpan!`);
                              setShowToast(true);
                              setTimeout(() => setShowToast(false), 3000);
                            };
                            img.src = readerEvent.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <a
                    href={`https://wa.me/${selectedProofBooking.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Halo Kak ${selectedProofBooking.client}, kami dari Tim Kasir Royal Drive Rental Mobil.\n\nUntuk pesanan ID *${selectedProofBooking.id}* (${selectedProofBooking.car}), tagihan DP adalah sebesar *${formatCurrency(selectedProofBooking.depositAmount)}*.\n\nMohon bantu kirimkan foto/screenshot bukti transfer m-Banking Anda agar pesanan segera kami jadwalkan. Terima kasih!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-slate-200 hover:border-emerald-400 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer text-center"
                    title="Hubungi Penyewa via WhatsApp untuk Meminta Bukti Transfer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Minta Struk via WA</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setSelectedProofBooking(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                {selectedProofBooking.paymentStatus !== "DP Lunas" && selectedProofBooking.paymentStatus !== "Lunas" ? (
                  <button
                    onClick={() => {
                      const updated = bookings.map(b => 
                        b.id === selectedProofBooking.id ? { ...b, paymentStatus: "DP Lunas" as const } : b
                      );
                      updateAndSaveBookings(updated);
                      setSelectedProofBooking(null);
                      setToastMessage(`Pembayaran DP untuk ${selectedProofBooking.id} berhasil diverifikasi & ditandai DP Lunas!`);
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui & Tandai DP Lunas</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const updated = bookings.map(b => 
                        b.id === selectedProofBooking.id ? { ...b, paymentStatus: "Belum Bayar" as const } : b
                      );
                      updateAndSaveBookings(updated);
                      setSelectedProofBooking({ ...selectedProofBooking, paymentStatus: "Belum Bayar" });
                      setToastMessage(`Status pembayaran ${selectedProofBooking.id} diubah ke Belum Bayar.`);
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                    }}
                    className="flex-1 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>Batalkan DP Lunas</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SURAT TUGAS & SURAT JALAN DRIVER */}
      {selectedDispatchBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-left my-8 animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:m-0">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                    Penugasan Operasional
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-slate-800">
                    Surat Tugas & Surat Jalan Driver ({selectedDispatchBooking.id})
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedDispatchBooking(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Form for Driver Assignment */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 space-y-4 text-xs print:hidden">
              {/* Quick 1-Click Driver Selector */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600 flex items-center justify-between">
                  <span>Pilih Dari Tim Driver Showroom</span>
                  <span className="text-[9px] text-emerald-600 font-bold">
                    {drivers.filter(d => d.status === "Standby").length} Driver Standby Siap
                  </span>
                </label>
                <select
                  value={dispatchDriverId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setDispatchDriverId(selectedId);
                    const found = drivers.find(d => d.id === selectedId);
                    if (found) {
                      setDispatchDriverName(found.name);
                      setDispatchDriverPhone(found.phone);
                    }
                  }}
                  className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-accent"
                >
                  <option value="">-- Pilih Dari Tim Driver (Otomatis Isi) atau Ketik Manual --</option>
                  {drivers.map((drv) => (
                    <option key={drv.id} value={drv.id}>
                      {drv.name} ({drv.simType} &bull; {drv.status === "Standby" ? "🟢 Siap / Standby" : drv.status === "On Trip" ? "🟡 On Trip" : "🔴 Off / Libur"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Nama Sopir Bertugas</label>
                  <input
                    type="text"
                    value={dispatchDriverName}
                    onChange={(e) => setDispatchDriverName(e.target.value)}
                    placeholder="Contoh: Bpk. Joko Santoso"
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">No. WhatsApp Driver</label>
                  <input
                    type="tel"
                    value={dispatchDriverPhone}
                    onChange={(e) => setDispatchDriverPhone(e.target.value)}
                    placeholder="Contoh: 081233445566"
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Jam Tiba / Penjemputan</label>
                  <input
                    type="text"
                    value={dispatchPickupTime}
                    onChange={(e) => setDispatchPickupTime(e.target.value)}
                    placeholder="Contoh: 08:30 WIB"
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Instruksi Khusus Driver</label>
                  <input
                    type="text"
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder="Contoh: Bawa papan nama, AC dingin, siapkan E-Toll"
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            {/* PRINTABLE DISPATCH SHEET (SURAT JALAN DRIVER) */}
            <div className="p-8 space-y-6 text-slate-900 bg-white font-sans text-xs">
              
              {/* Header Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="font-display font-black text-xl tracking-wider text-slate-900 uppercase">
                    {brandName || "ROYAL DRIVE"}
                  </h2>
                  <span className="text-[10px] text-slate-500 block">Surat Tugas Operasional & Surat Jalan Pengemudi</span>
                  <span className="text-[10px] text-slate-500 block">Hotline Operasional: {contactPhone || "021-8080-9999"}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">NO. SURAT TUGAS</span>
                  <span className="font-mono font-bold text-sm text-slate-900">ST-{selectedDispatchBooking.id}</span>
                  <span className="text-[10px] text-slate-500 block">{selectedDispatchBooking.date}</span>
                </div>
              </div>

              {/* Driver & Car Details Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">DATA PENGEMUDI</span>
                  <strong className="text-slate-900 text-sm block">{dispatchDriverName || selectedDispatchBooking.driverName || "Petugas Belum Dipilih"}</strong>
                  <span className="text-slate-600 font-mono text-xs">HP/WA: {dispatchDriverPhone || "0812-xxxx-xxxx"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">ARMADA & PLAT NOMOR</span>
                  <strong className="text-slate-900 text-sm block">{selectedDispatchBooking.car}</strong>
                  <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded inline-block mt-0.5">
                    {selectedDispatchBooking.carPlate}
                  </span>
                </div>
              </div>

              {/* Guest & Trip Details */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">RINCIAN PENJEMPUTAN & TAMU</span>
                <table className="w-full border border-slate-200 text-left">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 bg-slate-50 font-semibold w-1/3 text-slate-600">Nama Tamu / Penyewa</td>
                      <td className="p-2.5 font-bold text-slate-900">{selectedDispatchBooking.client}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 bg-slate-50 font-semibold text-slate-600">Nomor Telepon Tamu</td>
                      <td className="p-2.5 font-mono text-slate-900">{selectedDispatchBooking.phone}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 bg-slate-50 font-semibold text-slate-600">Jadwal Penjemputan</td>
                      <td className="p-2.5 font-bold text-red-600">{selectedDispatchBooking.startDate} &bull; Pukul {dispatchPickupTime}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 bg-slate-50 font-semibold text-slate-600">Titik / Alamat Jemput</td>
                      <td className="p-2.5 text-slate-900">{selectedDispatchBooking.pickupLocation || "Showroom"}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 bg-slate-50 font-semibold text-slate-600">Layanan Sewa</td>
                      <td className="p-2.5 font-semibold text-slate-900">{selectedDispatchBooking.rentalType} ({selectedDispatchBooking.durationDays} Hari)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 bg-slate-50 font-semibold text-slate-600">Instruksi Khusus</td>
                      <td className="p-2.5 text-slate-700 italic">{dispatchNotes}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div>
                  <span className="text-slate-500 block mb-12">Petugas Dispatcher Showroom,</span>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                    ( Bagian Operasional )
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-12">Pengemudi Bertugas,</span>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
                    ( {dispatchDriverName || "Nama Sopir"} )
                  </div>
                </div>
              </div>

            </div>

            {/* Action Buttons in Modal */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3 print:hidden">
              <a
                href={`https://wa.me/${dispatchDriverPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `*SURAT TUGAS PENGEMUDI - ${brandName || "ROYAL DRIVE"}*\n` +
                  `No. Tugas: ST-${selectedDispatchBooking.id}\n\n` +
                  `Halo ${dispatchDriverName || "Pak Sopir"}, berikut instruksi penugasan sewa mobil:\n` +
                  `• Tamu: ${selectedDispatchBooking.client} (${selectedDispatchBooking.phone})\n` +
                  `• Unit: ${selectedDispatchBooking.car} [${selectedDispatchBooking.carPlate}]\n` +
                  `• Tanggal: ${selectedDispatchBooking.startDate} s/d ${selectedDispatchBooking.endDate}\n` +
                  `• Jam Jemput: ${dispatchPickupTime}\n` +
                  `• Lokasi Jemput: ${selectedDispatchBooking.pickupLocation || "Showroom"}\n` +
                  `• Catatan: ${dispatchNotes}\n\n` +
                  `Mohon pastikan unit bersih, AC dingin, dan hadir di lokasi 30 menit lebih awal. Terima kasih!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all text-center cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Kirim Tugas ke WA Driver</span>
              </a>

              <button
                onClick={() => window.print()}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Surat Jalan</span>
              </button>

              <button
                onClick={() => {
                  const updated = bookings.map(b => 
                    b.id === selectedDispatchBooking.id 
                      ? { 
                          ...b, 
                          driverName: dispatchDriverName, 
                          driverPhone: dispatchDriverPhone, 
                          driverPickupTime: dispatchPickupTime, 
                          driverNotes: dispatchNotes 
                        } 
                      : b
                  );
                  updateAndSaveBookings(updated);

                  // Update driver roster status to On Trip if chosen from list
                  if (dispatchDriverId) {
                    const updatedDrivers = drivers.map(d => 
                      d.id === dispatchDriverId 
                        ? { ...d, status: "On Trip" as const, totalTrips: d.totalTrips + 1 } 
                        : d
                    );
                    saveDriversList(updatedDrivers);
                  }

                  setSelectedDispatchBooking(null);
                  setToastMessage("Data driver berhasil disimpan & status driver diubah menjadi 'On Trip'!");
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                }}
                className="px-5 py-3.5 bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Simpan Driver
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT DRIVER */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-left my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                    {editingDriver ? "Perbarui Data Driver" : "Registrasi Pengemudi Baru"}
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-slate-800">
                    {editingDriver ? `Edit: ${editingDriver.name}` : "Tambah Driver Showroom"}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsDriverModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleDriverFormSubmit} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Nama Lengkap Driver</label>
                  <input
                    type="text"
                    value={drvName}
                    onChange={(e) => setDrvName(e.target.value)}
                    placeholder="Contoh: Bpk. Joko Santoso"
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">No. WhatsApp / HP</label>
                  <input
                    type="tel"
                    value={drvPhone}
                    onChange={(e) => setDrvPhone(e.target.value)}
                    placeholder="Contoh: 081233445566"
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Golongan SIM</label>
                  <select
                    value={drvSimType}
                    onChange={(e) => setDrvSimType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-accent"
                  >
                    <option value="SIM A">SIM A (Mobil Pribadi)</option>
                    <option value="SIM B1 Umum">SIM B1 Umum (Minibus/Hiace)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Nomor SIM</label>
                  <input
                    type="text"
                    value={drvSimNum}
                    onChange={(e) => setDrvSimNum(e.target.value)}
                    placeholder="Nomor lisensi SIM"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Masa Berlaku SIM</label>
                  <input
                    type="date"
                    value={drvSimExpiry}
                    onChange={(e) => setDrvSimExpiry(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Status Awal Ketersediaan</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Standby", "On Trip", "Off"] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setDrvStatus(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        drvStatus === st
                          ? st === "Standby"
                            ? "bg-emerald-500 text-white border-emerald-600"
                            : st === "On Trip"
                            ? "bg-blue-500 text-white border-blue-600"
                            : "bg-slate-600 text-white border-slate-700"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st === "Standby" ? "🟢 Standby (Siap)" : st === "On Trip" ? "🟡 On Trip" : "⚪ Off (Libur)"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Catatan Khusus / Keahlian / Rute Favorit</label>
                <textarea
                  rows={3}
                  value={drvNotes}
                  onChange={(e) => setDrvNotes(e.target.value)}
                  placeholder="Contoh: Pengemudi ramah dan sabar, sangat hafal rute wisata Bandung & Puncak, mampu berbahasa Inggris dasar untuk tamu VIP."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent leading-relaxed"
                />
              </div>

              {/* Driver Avatar Uploader & URL */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
                <span className="font-display font-semibold text-[10px] text-slate-500 uppercase tracking-wider block">
                  Foto Profil Driver (Avatar)
                </span>
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-inner">
                    <img
                      src={drvAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file, 250, 250, 0.7);
                            setDrvAvatar(compressed);
                          } catch (err) {
                            console.error(err);
                            alert("Gagal memproses foto driver.");
                          }
                        }
                      }}
                      className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[9px] file:font-display file:font-bold file:uppercase file:tracking-wider file:bg-accent file:text-white hover:file:bg-accent-hover cursor-pointer w-full"
                    />
                    <input
                      type="text"
                      value={drvAvatar}
                      onChange={(e) => setDrvAvatar(e.target.value)}
                      placeholder="Atau masukkan tautan URL foto profil driver..."
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer"
                >
                  {editingDriver ? "Perbarui Driver" : "Simpan Driver Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KELOLA DEPOSIT JAMINAN & REFUND ETLE */}
      {selectedDepositBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-left my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                    Uang Jaminan Lepas Kunci (Security Deposit)
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-slate-800">
                    Kelola Deposit: {selectedDepositBooking.id} ({selectedDepositBooking.client})
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedDepositBooking(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary Box */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Penyewa</span>
                  <span className="font-bold text-slate-800 truncate block">{selectedDepositBooking.client}</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Armada</span>
                  <span className="font-bold text-slate-800 truncate block">{selectedDepositBooking.carPlate}</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Status Sewa</span>
                  <span className="font-bold text-slate-800 block">{selectedDepositBooking.status}</span>
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[9px] uppercase font-bold text-emerald-700 block">Nominal Deposit</span>
                  <span className="font-extrabold text-emerald-800 block">
                    {formatCurrency(selectedDepositBooking.securityDepositAmount || 1000000)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Form */}
            <div className="p-6 space-y-5 text-xs font-sans">
              {/* Select Resolution Status */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600 block">
                  Pilih Tindakan & Status Uang Jaminan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositAction("refund")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      depositAction === "refund" && selectedDepositBooking.securityDepositStatus !== "Pemeriksaan ETLE"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="font-bold text-xs block text-emerald-700">✓ Refund Penuh</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-1">
                      Bebas tilang ETLE & bebas kerusakan. Transfer utuh.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSaveSecurityDeposit(selectedDepositBooking.id, "Pemeriksaan ETLE");
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedDepositBooking.securityDepositStatus === "Pemeriksaan ETLE"
                        ? "bg-blue-50 border-blue-500 text-blue-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="font-bold text-xs block text-blue-700">⏳ Cek ETLE (1x24 Jam)</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-1">
                      Mobil kembali, sedang verifikasi tilang kamera lalu lintas.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositAction("deduct")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      depositAction === "deduct"
                        ? "bg-rose-50 border-rose-500 text-rose-900 shadow-xs"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="font-bold text-xs block text-rose-700">⚠️ Dipotong Denda</span>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-1">
                      Ada tilang kamera atau kerusakan lecet unit.
                    </span>
                  </button>
                </div>
              </div>

              {/* Deduction Fields if Deduct is chosen */}
              {depositAction === "deduct" && (
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-rose-800">
                        Nominal Pemotongan Denda (Rp)
                      </label>
                      <input
                        type="number"
                        value={refundDeduction}
                        onChange={(e) => setRefundDeduction(Number(e.target.value))}
                        placeholder="Contoh: 250000"
                        className="w-full bg-white border border-rose-300 px-3 py-2 rounded-xl text-xs font-mono font-bold text-rose-700 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-rose-800">
                        Alasan / Bukti Pelanggaran
                      </label>
                      <input
                        type="text"
                        value={refundDeductionReason}
                        onChange={(e) => setRefundDeductionReason(e.target.value)}
                        placeholder="Contoh: Tilang ETLE ganjil-genap Rasuna Said"
                        className="w-full bg-white border border-rose-300 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Sisa Dana Ditransfer ke Penyewa:</span>
                    <span className="font-display font-black text-sm text-emerald-600">
                      {formatCurrency(Math.max(0, (selectedDepositBooking.securityDepositAmount || 1000000) - refundDeduction))}
                    </span>
                  </div>
                </div>
              )}

              {/* Bank Account Destination */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                  Rekening Tujuan Pengembalian (Penyewa)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Bank / E-Wallet</label>
                    <select
                      value={refundBank}
                      onChange={(e) => setRefundBank(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-accent"
                    >
                      <option value="BCA">BCA (Bank Central Asia)</option>
                      <option value="Mandiri">Bank Mandiri</option>
                      <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                      <option value="BNI">BNI (Bank Negara Indonesia)</option>
                      <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                      <option value="CIMB Niaga">CIMB Niaga</option>
                      <option value="Bank Jago">Bank Jago</option>
                      <option value="SeaBank">SeaBank</option>
                      <option value="GoPay / OVO">GoPay / OVO</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Nomor Rekening</label>
                    <input
                      type="text"
                      value={refundAccount}
                      onChange={(e) => setRefundAccount(e.target.value)}
                      placeholder="Contoh: 1234567890"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Atas Nama Pemilik</label>
                    <input
                      type="text"
                      value={refundAccName}
                      onChange={(e) => setRefundAccName(e.target.value)}
                      placeholder="Nama pemilik rekening"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons & WhatsApp Notification */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/${selectedDepositBooking.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `*KONFIRMASI PENGEMBALIAN UANG JAMINAN (SECURITY DEPOSIT)*\n` +
                    `Showroom: ${brandName || "ROYAL DRIVE"}\n` +
                    `No. Booking: ${selectedDepositBooking.id}\n` +
                    `Penyewa: ${selectedDepositBooking.client}\n` +
                    `Unit: ${selectedDepositBooking.car} [${selectedDepositBooking.carPlate}]\n\n` +
                    (depositAction === "deduct"
                      ? `*Status: DIPOTONG DENDA / TILANG ETLE*\n` +
                        `• Deposit Awal: ${formatCurrency(selectedDepositBooking.securityDepositAmount || 1000000)}\n` +
                        `• Potongan: ${formatCurrency(refundDeduction)} (${refundDeductionReason || "Tilang/Kerusakan"})\n` +
                        `• Sisa Dana Ditransfer: ${formatCurrency(Math.max(0, (selectedDepositBooking.securityDepositAmount || 1000000) - refundDeduction))}\n` +
                        `• Tujuan: ${refundBank} ${refundAccount} a/n ${refundAccName}\n\n` +
                        `Dana sisa telah kami transfer. Terima kasih telah mempercayakan perjalanan Anda bersama kami!`
                      : `*Status: REFUND PENUH (SELESAI)*\n` +
                        `• Deposit Awal: ${formatCurrency(selectedDepositBooking.securityDepositAmount || 1000000)}\n` +
                        `• Potongan: Rp 0 (Bebas Tilang ETLE & Kerusakan)\n` +
                        `• Total Ditransfer: ${formatCurrency(selectedDepositBooking.securityDepositAmount || 1000000)}\n` +
                        `• Tujuan: ${refundBank} ${refundAccount} a/n ${refundAccName}\n\n` +
                        `Unit telah dicek bersih dan dana deposit telah kami kembalikan utuh ke rekening Anda. Terima kasih!`
                    )
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 text-center cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Kirim Notifikasi WA Penyewa</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const finalStatus = depositAction === "deduct" ? "Dipotong Denda" : "Refund Selesai";
                    handleSaveSecurityDeposit(selectedDepositBooking.id, finalStatus);
                  }}
                  className="px-6 py-3.5 bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer"
                >
                  Simpan Status Refund
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: CATAT SERVIS BENGKEL */}
      {selectedCarForService && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-left my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                    Log Perawatan Bengkel
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-slate-800">
                    Catat Servis: {selectedCarForService.carName} ({selectedCarForService.carPlate})
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedCarForService(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form inputs */}
            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Tanggal Servis</label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Odometer KM Saat Ini</label>
                  <input
                    type="number"
                    value={serviceOdo}
                    onChange={(e) => setServiceOdo(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Jenis Perawatan</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-accent"
                  >
                    <option value="Ganti Oli Mesin">Ganti Oli Mesin</option>
                    <option value="Kampas Rem">Kampas Rem</option>
                    <option value="Tune Up & Busi">Tune Up & Busi</option>
                    <option value="Ban & Spooring">Ban & Spooring-Balancing</option>
                    <option value="AC & Kelistrikan">AC & Kelistrikan</option>
                    <option value="Body Repair / Cat">Body Repair / Cat</option>
                    <option value="Servis Rutin Berkala">Servis Rutin Berkala</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Total Biaya Bengkel (Rp)</label>
                  <input
                    type="number"
                    value={serviceCost}
                    onChange={(e) => setServiceCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold text-red-600 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Nama Bengkel / Rekanan</label>
                <input
                  type="text"
                  value={serviceWorkshop}
                  onChange={(e) => setServiceWorkshop(e.target.value)}
                  placeholder="Contoh: Auto2000 Cilandak / Shop & Drive"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Catatan Pekerjaan / Suku Cadang</label>
                <textarea
                  rows={2}
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="Rincian part yang diganti, merk oli, dsb."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedCarForService(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newRecord: MaintenanceRecord = {
                      id: `SRV-${Date.now()}`,
                      carId: selectedCarForService.carId,
                      carName: selectedCarForService.carName,
                      carPlate: selectedCarForService.carPlate,
                      serviceDate: serviceDate,
                      odometer: serviceOdo,
                      serviceType: serviceType,
                      workshopName: serviceWorkshop,
                      cost: serviceCost,
                      notes: serviceNotes
                    };
                    const updatedMaintenance = [newRecord, ...maintenanceRecords];
                    saveMaintenanceRecords(updatedMaintenance);

                    // Update compliance odometer & next service
                    const updatedCompliance = complianceList.map(c => 
                      c.carId === selectedCarForService.carId
                        ? {
                            ...c,
                            lastServiceOdo: serviceOdo,
                            currentOdo: serviceOdo,
                            nextServiceOdo: serviceOdo + 10000
                          }
                        : c
                    );
                    saveComplianceList(updatedCompliance);

                    // Also record to expenses automatically
                    const newExp: ExpenseRecord = {
                      id: `EXP-${Date.now()}`,
                      date: serviceDate,
                      category: "Servis & Suku Cadang",
                      carName: selectedCarForService.carName,
                      carPlate: selectedCarForService.carPlate,
                      amount: serviceCost,
                      description: `${serviceType} di ${serviceWorkshop}: ${serviceNotes}`,
                      recordedBy: "Admin Bengkel"
                    };
                    saveExpenseRecords([newExp, ...expenseRecords]);

                    setSelectedCarForService(null);
                    setToastMessage(`Catatan servis ${selectedCarForService.carPlate} berhasil disimpan & dipotong ke kas operasional!`);
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  }}
                  className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer"
                >
                  Simpan Catatan Servis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE PAJAK STNK ARMADA */}
      {selectedCarForTax && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-left my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                    Perpanjangan Legalitas
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-slate-800">
                    Update Pajak STNK: {selectedCarForTax.carName} ({selectedCarForTax.carPlate})
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedCarForTax(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Tanggal Baru Jatuh Tempo Pajak Tahunan (PKB)</label>
                <input
                  type="date"
                  value={newTaxExpiry}
                  onChange={(e) => setNewTaxExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Tanggal Baru Jatuh Tempo Plat 5 Tahunan</label>
                <input
                  type="date"
                  value={newPlateExpiry}
                  onChange={(e) => setNewPlateExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Biaya Pembayaran Pajak di Samsat (Rp)</label>
                <input
                  type="number"
                  value={taxCost}
                  onChange={(e) => setTaxCost(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold text-red-600 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedCarForTax(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updatedCompliance = complianceList.map(c => 
                      c.carId === selectedCarForTax.carId
                        ? {
                            ...c,
                            taxExpiryDate: newTaxExpiry || c.taxExpiryDate,
                            plateExpiryDate: newPlateExpiry || c.plateExpiryDate
                          }
                        : c
                    );
                    saveComplianceList(updatedCompliance);

                    if (taxCost > 0) {
                      const newExp: ExpenseRecord = {
                        id: `EXP-${Date.now()}`,
                        date: new Date().toISOString().split("T")[0],
                        category: "Pajak STNK & Asuransi",
                        carName: selectedCarForTax.carName,
                        carPlate: selectedCarForTax.carPlate,
                        amount: taxCost,
                        description: `Pembayaran PKB Pajak Tahunan Samsat untuk ${selectedCarForTax.carPlate}`,
                        recordedBy: "Admin Samsat"
                      };
                      saveExpenseRecords([newExp, ...expenseRecords]);
                    }

                    setSelectedCarForTax(null);
                    setToastMessage(`Masa berlaku Pajak STNK ${selectedCarForTax.carPlate} berhasil diperbarui!`);
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Simpan Masa Berlaku
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH PENGELUARAN KAS */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-left my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                    Buku Kas Keluar
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-slate-800">
                    Catat Pengeluaran Operasional Showroom
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Kategori Biaya</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-accent"
                  >
                    <option value="Cuci & Salon Mobil">Cuci & Salon Mobil</option>
                    <option value="BBM Operasional">BBM Operasional</option>
                    <option value="Uang Jalan / Gaji Driver">Uang Jalan / Gaji Driver</option>
                    <option value="Servis & Suku Cadang">Servis & Suku Cadang</option>
                    <option value="Pajak STNK & Asuransi">Pajak STNK & Asuransi</option>
                    <option value="Lain-lain">Lain-lain / Operasional Kantor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Unit Terkait</label>
                  <input
                    type="text"
                    value={expCarName}
                    onChange={(e) => setExpCarName(e.target.value)}
                    placeholder="Semua Unit / Nama Mobil"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Nominal Pengeluaran (Rp)</label>
                  <input
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold text-red-600 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Keterangan / Keperluan</label>
                <textarea
                  rows={2}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="Contoh: Cuci hidrolik 4 mobil sebelum weekend, beli pengharum kabin."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newExp: ExpenseRecord = {
                      id: `EXP-${Date.now()}`,
                      date: expDate,
                      category: expCategory,
                      carName: expCarName,
                      amount: expAmount,
                      description: expDesc,
                      recordedBy: expRecorder
                    };
                    saveExpenseRecords([newExp, ...expenseRecords]);
                    setIsExpenseModalOpen(false);
                    setToastMessage(`Pengeluaran kas sebesar ${formatCurrency(expAmount)} berhasil dicatat!`);
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  }}
                  className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PERPANJANGAN MASA SEWA (RENTAL EXTENSION) */}
      {selectedExtendBooking && (() => {
        const carObj = cars.find(c => c.name.toLowerCase() === selectedExtendBooking.car.toLowerCase());
        const dailyPrice = carObj 
          ? carObj.pricePerDay + (selectedExtendBooking.rentalType === "Dengan Sopir" ? carObj.driverPricePerDay : 0)
          : Math.round(selectedExtendBooking.totalPrice / (selectedExtendBooking.durationDays || 1));
        const addedCost = extDays * dailyPrice;
        const totalNewPrice = selectedExtendBooking.totalPrice + addedCost;

        // WhatsApp message for extension confirmation (Addendum)
        const waMessage = `Halo Bpk/Ibu *${selectedExtendBooking.client}*,\n\nBerikut konfirmasi perpanjangan sewa resmi dari *${brandName || 'ROYAL DRIVE'}*:\n\n📄 *ADDENDUM PERPANJANGAN SEWA*\n• No. Booking: *${selectedExtendBooking.id}*\n• Unit Armada: *${selectedExtendBooking.car}* (${selectedExtendBooking.carPlate})\n• Tambahan Durasi: *+${extDays} Hari*\n• Batas Selesai Baru: *${extNewEndDate}*\n• Biaya Tambahan: *${formatCurrency(addedCost)}* (Status: *${extPaymentStatus}*)\n• Total Akumulasi Biaya: *${formatCurrency(totalNewPrice)}*\n${extNotes ? `• Catatan: ${extNotes}\n` : ''}\nUnit telah diperbarui izin operasinya pada sistem kami. Selamat menikmati sisa perjalanan Anda dan salam hangat! 🙏✨`;
        const waUrl = `https://wa.me/${selectedExtendBooking.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-left my-8 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 block">
                      Addendum Perpanjangan Sewa
                    </span>
                    <h3 className="font-display font-extrabold text-sm text-slate-800">
                      Perpanjang Durasi ({selectedExtendBooking.id})
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExtendBooking(null)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs font-sans">
                {/* Booking Info Banner */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Penyewa & Unit</span>
                    <h4 className="font-bold text-slate-800 text-xs">{selectedExtendBooking.client}</h4>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {selectedExtendBooking.car} &bull; <span className="font-mono text-slate-500">{selectedExtendBooking.carPlate}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Periode Saat Ini</span>
                    <span className="font-mono text-[11px] text-slate-700 block font-semibold">
                      s/d {selectedExtendBooking.endDate}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {selectedExtendBooking.durationDays} Hari ({selectedExtendBooking.rentalType})
                    </span>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Tambah Hari Sewa</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={extDays}
                        onChange={(e) => {
                          const days = Math.max(1, parseInt(e.target.value) || 1);
                          setExtDays(days);
                          const curr = new Date(selectedExtendBooking.endDate);
                          curr.setDate(curr.getDate() + days);
                          setExtNewEndDate(curr.toISOString().split("T")[0]);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-accent"
                      />
                      <span className="text-xs font-bold text-slate-600">Hari</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Tanggal Selesai Baru</label>
                    <input
                      type="date"
                      value={extNewEndDate}
                      min={selectedExtendBooking.endDate}
                      onChange={(e) => {
                        setExtNewEndDate(e.target.value);
                        const startD = new Date(selectedExtendBooking.endDate);
                        const newD = new Date(e.target.value);
                        const diff = Math.max(1, Math.ceil((newD.getTime() - startD.getTime()) / (1000 * 3600 * 24)));
                        setExtDays(diff);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Payment Option */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Metode Tagihan Tambahan</label>
                  <select
                    value={extPaymentStatus}
                    onChange={(e) => setExtPaymentStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-accent"
                  >
                    <option value="Lunas">Lunas (Penyewa telah transfer biaya tambahan)</option>
                    <option value="Tagihan Akhir">Tagihan Akhir (Ditagihkan saat mobil dikembalikan)</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Catatan / Alasan Perpanjangan</label>
                  <input
                    type="text"
                    value={extNotes}
                    onChange={(e) => setExtNotes(e.target.value)}
                    placeholder="Contoh: Tambah acara keluarga / pekerjaan dinas luar kota"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Cost Breakdown Card */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Tarif Harian Unit (+Sopir):</span>
                    <span className="font-mono font-bold text-slate-800">{formatCurrency(dailyPrice)} / hari</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Biaya Tambahan ({extDays} Hari):</span>
                    <span className="font-mono font-bold text-amber-700">+{formatCurrency(addedCost)}</span>
                  </div>
                  <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">Total Akumulasi Biaya Baru:</span>
                    <span className="font-mono text-sm font-extrabold text-accent">{formatCurrency(totalNewPrice)}</span>
                  </div>
                </div>

                {/* WhatsApp Addendum Button */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Kirim Nota Addendum ke WA Penyewa</span>
                </a>

                {/* Save Buttons */}
                <div className="pt-2 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedExtendBooking(null)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmExtension}
                    className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer"
                  >
                    Simpan Perpanjangan
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: TAMBAH / EDIT ATURAN TARIF MUSIMAN (PEAK SEASON) */}
      {isSeasonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-left my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 block">
                    Dynamic Pricing Rule
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-slate-800">
                    {editingSeason ? "Edit Aturan Tarif Musiman" : "Tambah Musim Libur / Peak Season Baru"}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsSeasonModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSeason} className="p-6 space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Nama Periode / Musim Libur</label>
                <input
                  type="text"
                  required
                  value={seasonName}
                  onChange={(e) => setSeasonName(e.target.value)}
                  placeholder="Contoh: Libur Cuti Bersama Idul Adha"
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Tipe Aturan</label>
                  <select
                    value={seasonType}
                    onChange={(e) => setSeasonType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-accent"
                  >
                    <option value="peak_season">Periode Kalender (Tanggal Tertentu)</option>
                    <option value="weekend">Akhir Pekan (Sabtu & Minggu)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Kenaikan Tarif (%)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={seasonPercent}
                      onChange={(e) => setSeasonPercent(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold text-amber-700 focus:outline-none focus:border-accent"
                    />
                    <span className="text-xs font-bold text-amber-700">%</span>
                  </div>
                </div>
              </div>

              {seasonType === "peak_season" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Tanggal Mulai</label>
                    <input
                      type="date"
                      required
                      value={seasonStart}
                      onChange={(e) => setSeasonStart(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Tanggal Selesai</label>
                    <input
                      type="date"
                      required
                      value={seasonEnd}
                      min={seasonStart}
                      onChange={(e) => setSeasonEnd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-600">Keterangan / Deskripsi Aturan</label>
                <textarea
                  rows={2}
                  value={seasonDesc}
                  onChange={(e) => setSeasonDesc(e.target.value)}
                  placeholder="Contoh: Lonjakan permintaan pemesanan mobil mudik antar-provinsi."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsSeasonModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer"
                >
                  Simpan Aturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KELOLA KATEGORI ARMADA (CATEGORY MANAGER) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-left my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-accent block">
                    Struktur Armada Showroom
                  </span>
                  <h3 className="font-display font-extrabold text-base text-slate-800">
                    Manajemen Kategori Kendaraan
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCatOldName(null);
                  setNewCategoryInput("");
                }}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs font-sans">
              {/* Add New Category Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">
                  + Tambah Kategori Baru
                </span>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newCategoryInput.trim()) {
                      const success = handleAddCategory(newCategoryInput.trim());
                      if (success) setNewCategoryInput("");
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="Contoh: SUV Tangguh / Campervan..."
                    className="flex-1 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-accent font-medium placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/20 cursor-pointer shrink-0"
                  >
                    Tambah
                  </button>
                </form>
              </div>

              {/* Existing Categories List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold px-1">
                  <span>Daftar Kategori Aktif ({categories.length})</span>
                  <span>Jumlah Unit</span>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const carCount = cars.filter(c => c.category === cat).length;
                    const isEditing = editingCatOldName === cat;

                    return (
                      <div
                        key={cat}
                        className="p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs transition-all"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingCatNewName}
                              onChange={(e) => setEditingCatNewName(e.target.value)}
                              className="flex-1 bg-slate-50 border border-accent px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleRenameCategory(cat, editingCatNewName)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCatOldName(null)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-3">
                              <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                              <div>
                                <span className="font-display font-bold text-slate-800 text-xs block">
                                  {cat}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {carCount > 0 ? `${carCount} mobil terdaftar` : "Belum ada armada"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold font-mono mr-1">
                                {carCount} Unit
                              </span>

                              {/* Edit / Rename */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCatOldName(cat);
                                  setEditingCatNewName(cat);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Ubah Nama Kategori"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Kategori"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Note / Tip */}
              <p className="text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl leading-relaxed">
                💡 <b>Informasi:</b> Mengubah nama (<i>rename</i>) kategori akan otomatis memperbarui seluruh data mobil yang berada di bawah kategori tersebut, sehingga kategori di beranda maupun filter pencarian selalu sinkron.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCatOldName(null);
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[100] flex items-center space-x-3 bg-emerald-500 text-white font-sans text-xs px-5 py-4 rounded-2xl shadow-xl"
          >
            <Check className="w-5 h-5 flex-shrink-0 bg-white/20 p-0.5 rounded-full" />
            <div>
              <span className="font-bold block">Berhasil Disimpan</span>
              <span className="opacity-90">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Floating Incoming Booking Alert Banner */}
      <AnimatePresence>
        {isIncomingAlertOpen && latestIncomingBooking && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-[9999] max-w-md w-[calc(100vw-3rem)] bg-slate-900/95 backdrop-blur-md border-2 border-accent/70 shadow-2xl rounded-2xl p-4 text-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                    <Bell className="w-5 h-5 animate-bounce" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                      Pemesanan Baru Masuk!
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {latestIncomingBooking.id}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-white mt-1">
                    {latestIncomingBooking.client}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {latestIncomingBooking.car} &bull; {latestIncomingBooking.rentalType}
                  </p>
                  <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-amber-400 font-bold">
                    <span>{latestIncomingBooking.durationDays} Hari</span>
                    <span>&bull;</span>
                    <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(latestIncomingBooking.totalPrice)}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIncomingAlertOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup Notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedVerificationBooking(latestIncomingBooking);
                  setIsIncomingAlertOpen(false);
                }}
                className="flex-1 bg-accent hover:bg-accent-hover text-white text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-accent/20 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verifikasi & Buka Pesanan</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("bookings");
                  setBookingSearchQuery(latestIncomingBooking.id);
                  setIsIncomingAlertOpen(false);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl transition-all cursor-pointer"
              >
                Buka di Tabel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


        {/* ================= MODAL TEMPLATE WHATSAPP CEPAT ================= */}
        {isWaModalOpen && selectedWaBooking && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-emerald-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div className="flex items-center space-x-2 text-emerald-800">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="font-display font-extrabold text-sm uppercase tracking-wider">
                      Kirim Pesan WhatsApp Cepat
                    </h4>
                    <span className="text-[10px] text-slate-400 font-sans block">
                      Kepada: {selectedWaBooking.client} ({selectedWaBooking.phone})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWaModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Template Tab Selector */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setWaTemplateType("dp")}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    waTemplateType === "dp"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>1. Tagihan DP 30%</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWaTemplateType("ready")}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    waTemplateType === "ready"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>2. Unit Siap & Supir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWaTemplateType("return")}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    waTemplateType === "return"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>3. Pengingat Selesai (H-3)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWaTemplateType("deposit")}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    waTemplateType === "deposit"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>4. Refund Jaminan Sewa</span>
                </button>
              </div>

              {/* Message Preview Box */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">Pratinjau Pesan yang Akan Dikirim:</span>
                <div className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto">
                  {waTemplateType === "dp" && (
`Halo Bapak/Ibu ${selectedWaBooking.client},

Terima kasih telah melakukan reservasi di Royal Drive Rental Mobil.
ID Booking: ${selectedWaBooking.id}
Unit: ${selectedWaBooking.car} (${selectedWaBooking.carPlate})
Jadwal: ${selectedWaBooking.startDate} s/d ${selectedWaBooking.endDate} (${selectedWaBooking.durationDays} Hari)

Rincian Pembayaran Uang Muka (DP 30%):
Nominal DP: ${formatRupiah(selectedWaBooking.depositAmount || Math.round(selectedWaBooking.totalPrice * 0.3))}
Sisa Pelunasan: ${formatRupiah(selectedWaBooking.totalPrice - (selectedWaBooking.depositAmount || Math.round(selectedWaBooking.totalPrice * 0.3)))} (di lokasi serah terima)

Rekening Resmi PT Royal Drive:
- BCA: 8820-9918-22
- Mandiri: 137-00-99812-00
a/n PT ROYAL DRIVE INDONESIA

Mohon konfirmasi bukti transfer sebelum 2 jam ke depan agar unit tetap terkunci aman untuk Anda. Terima kasih!`
                  )}

                  {waTemplateType === "ready" && (
`Halo Bapak/Ibu ${selectedWaBooking.client},

Pemberitahuan resmi dari Royal Drive:
Unit armada Anda: ${selectedWaBooking.car} (Plat: ${selectedWaBooking.carPlate}) saat ini telah SELESAI DICUCI BERSIH & MELEWATI INSPEKSI 25 TITIK.

${selectedWaBooking.rentalType === "Dengan Sopir" ? `Supir Anda: ${selectedWaBooking.driverName || "Driver Profesional Royal Drive"} (${selectedWaBooking.driverPhone || "Standby"}) siap meluncur menjemput di ${selectedWaBooking.pickupLocation || "lokasi penjemputan"}.` : `Unit siap diambil / diantar ke ${selectedWaBooking.pickupLocation || "lokasi yang disepakati"}.`}

Semoga perjalanan Anda aman, lancar, dan menyenangkan bersama Royal Drive!`
                  )}

                  {waTemplateType === "return" && (
`Halo Bapak/Ibu ${selectedWaBooking.client},

Mengingatkan bahwa masa sewa armada ${selectedWaBooking.car} (${selectedWaBooking.carPlate}) akan BERAKHIR HARI INI pukul 18:00 WIB.

Mohon persiapkan unit dan pastikan barang berharga pribadi tidak tertinggal di dalam kendaraan. Jika berencana memperpanjang masa sewa (+Overtime), mohon segera beri tahu kami agar jadwal armada dapat disesuaikan. Terima kasih!`
                  )}

                  {waTemplateType === "deposit" && (
`Halo Bapak/Ibu ${selectedWaBooking.client},

Terima kasih telah mempercayakan perjalanan Anda kepada Royal Drive.
Pemeriksaan fisik unit ${selectedWaBooking.car} dan pengecekan tilang elektronik (ETLE) telah selesai dengan hasil BAIK.

Uang Jaminan Sewa (Deposit): ${formatRupiah(selectedWaBooking.securityDepositAmount || 500000)} telah kami transfer kembali ke rekening Anda.

Sampai jumpa pada perjalanan berikutnya bersama Royal Drive!`
                  )}
                </div>
              </div>

              {/* Send Button */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWaModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    let msg = "";
                    if (waTemplateType === "dp") {
                      msg = `Halo Bapak/Ibu ${selectedWaBooking.client},\n\nTerima kasih telah melakukan reservasi di Royal Drive Rental Mobil.\nID Booking: ${selectedWaBooking.id}\nUnit: ${selectedWaBooking.car} (${selectedWaBooking.carPlate})\nJadwal: ${selectedWaBooking.startDate} s/d ${selectedWaBooking.endDate} (${selectedWaBooking.durationDays} Hari)\n\nTagihan DP 30%: ${formatRupiah(selectedWaBooking.depositAmount || Math.round(selectedWaBooking.totalPrice * 0.3))}\nRekening BCA: 8820-9918-22 a/n PT ROYAL DRIVE INDONESIA\n\nMohon konfirmasi bukti transfer agar unit terkunci. Terima kasih!`;
                    } else if (waTemplateType === "ready") {
                      msg = `Halo Bapak/Ibu ${selectedWaBooking.client},\n\nUnit armada Anda: ${selectedWaBooking.car} (${selectedWaBooking.carPlate}) telah SIAP & BERSIH.\n${selectedWaBooking.rentalType === "Dengan Sopir" ? `Supir Anda: ${selectedWaBooking.driverName || "Driver Resmi"} (${selectedWaBooking.driverPhone || "-"}) siap meluncur.` : `Unit siap diantar/diambil di ${selectedWaBooking.pickupLocation || "Showroom"}.`}\n\nTerima kasih!`;
                    } else if (waTemplateType === "return") {
                      msg = `Halo Bapak/Ibu ${selectedWaBooking.client},\n\nMengingatkan bahwa masa sewa armada ${selectedWaBooking.car} (${selectedWaBooking.carPlate}) akan BERAKHIR HARI INI pukul 18:00 WIB. Mohon persiapkan serah terima unit. Terima kasih!`;
                    } else {
                      msg = `Halo Bapak/Ibu ${selectedWaBooking.client},\n\nUang jaminan sewa (deposit) untuk unit ${selectedWaBooking.car} telah kami transfer kembali 100%. Terima kasih telah menyewa di Royal Drive!`;
                    }
                    const cleanPhone = selectedWaBooking.phone.replace(/\D/g, "");
                    const targetPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
                    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
                    window.open(url, "_blank");
                    setIsWaModalOpen(false);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/25"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka & Kirim WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}
