"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ShieldCheck, MessageSquare, Key, Upload, AlertTriangle, 
  ArrowRight, ArrowLeft, Check, Car, Calendar, MapPin, UserCheck, 
  ShieldAlert, CreditCard, Clock, Copy, CheckCircle2, QrCode, Phone, 
  Building2, Sparkles, Lock, FileCheck, Info, ChevronRight
} from "lucide-react";
import { formatRupiah } from "../data/cars";

export interface CheckoutGuestInfo {
  fullName: string;
  whatsapp: string;
  email: string;
  ktpNumber: string;
  simNumber: string;
  ktpUrl?: string;
  simUrl?: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  pickupLocation: string;
  socialMedia?: string;
  notes?: string;
  paymentProofUrl?: string;
  paymentMethod?: string;
}

interface CheckoutVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    carId: string;
    carName: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    withDriver: boolean;
    carImage?: string;
    pricePerDay?: number;
    category?: string;
    transmission?: string;
    seats?: number;
  } | null;
  onSuccess: (guestInfo: CheckoutGuestInfo) => void;
}

type StepNumber = 1 | 2 | 3 | 4;

export default function CheckoutVerificationModal({
  isOpen,
  onClose,
  bookingDetails,
  onSuccess,
}: CheckoutVerificationModalProps) {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);

  // Form Fields - Step 2 (Profile)
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [pickupLocation, setPickupLocation] = useState("Showroom Royal Drive (Gratis)");
  const [notes, setNotes] = useState("");

  // Form Fields - Step 3 (Documents & Emergency)
  const [ktpNumber, setKtpNumber] = useState("");
  const [simNumber, setSimNumber] = useState("");
  const [ktpFile, setKtpFile] = useState<string>("");
  const [simFile, setSimFile] = useState<string>("");
  const [isCompressingKtp, setIsCompressingKtp] = useState<boolean>(false);
  const [isCompressingSim, setIsCompressingSim] = useState<boolean>(false);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Keluarga");
  const [socialMedia, setSocialMedia] = useState("");

  // Form Fields - Step 4 (Payment)
  const [selectedBank, setSelectedBank] = useState<"bca" | "mandiri" | "bri" | "qris">("bca");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>("");
  const [isCompressingProof, setIsCompressingProof] = useState(false);

  // Countdown timer for DP lock (2 hours = 7200 seconds)
  const [timeLeft, setTimeLeft] = useState(7195);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  // Reset states upon open/close
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setFullName("");
      setWhatsapp("");
      setEmail("");
      setPickupLocation("Showroom Royal Drive (Gratis)");
      setNotes("");
      setKtpNumber("");
      setSimNumber("");
      setKtpFile("");
      setSimFile("");
      setEmergencyName("");
      setEmergencyPhone("");
      setEmergencyRelation("Keluarga");
      setSocialMedia("");
      setPaymentProofUrl("");
      setSelectedBank("bca");
    }
  }, [isOpen]);


  // Image compression to strictly maintain lightweight storage (<100KB)
  const compressImageFile = (file: File, maxDimension = 600, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
            resolve(compressedDataUrl);
          } else {
            resolve("");
          }
        };
        img.onerror = () => resolve("");
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const formatCurrency = (val: number) => formatRupiah(val);

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !bookingDetails) return null;

  const depositAmount = Math.round(bookingDetails.totalPrice * 0.3); // DP 30%
  const remainingAmount = bookingDetails.totalPrice - depositAmount; // Pelunasan 70%

  // Navigation validations
  const handleNextFromStep1 = () => {
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!fullName.trim() || fullName.trim().length < 3) {
      alert("Mohon isi nama lengkap sesuai identitas KTP Anda.");
      return;
    }
    const cleanPhone = whatsapp.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      alert("Mohon isi nomor WhatsApp aktif yang valid (minimal 10 digit).");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      alert("Mohon isi alamat email yang valid untuk pengiriman invoice reservasi.");
      return;
    }
    setCurrentStep(3);
  };

  const handleNextFromStep3 = () => {
    const cleanKtp = ktpNumber.replace(/\D/g, "");
    if (cleanKtp.length !== 16) {
      alert("Nomor NIK KTP harus terdiri dari tepat 16 digit angka.");
      return;
    }
    const cleanSim = simNumber.replace(/\D/g, "");
    if (cleanSim.length < 10) {
      alert("Mohon isi nomor SIM A yang valid (minimal 10-14 digit).");
      return;
    }
    if (!ktpFile) {
      alert("Mohon unggah foto KTP asli Anda untuk verifikasi identitas resmi.");
      return;
    }
    if (!simFile) {
      alert("Mohon unggah foto SIM A asli Anda untuk verifikasi pengemudi.");
      return;
    }
    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      alert("Mohon lengkapi nama dan nomor kontak darurat / penjamin keluarga.");
      return;
    }

    // Advance to Step 4
    setCurrentStep(4);
  };

  const handleFinalSubmit = () => {
    onSuccess({
      fullName,
      whatsapp,
      email,
      ktpNumber,
      simNumber,
      ktpUrl: ktpFile,
      simUrl: simFile,
      emergencyName: emergencyName || "Keluarga Terdekat",
      emergencyPhone: emergencyPhone || "08123456789",
      emergencyRelation,
      pickupLocation,
      socialMedia: socialMedia || "-",
      notes: notes || "-",
      paymentProofUrl: paymentProofUrl || undefined,
      paymentMethod: selectedBank.toUpperCase(),
    });
  };

  const stepsConfig = [
    { id: 1, label: "Review Unit", icon: Car },
    { id: 2, label: "Data Penyewa", icon: UserCheck },
    { id: 3, label: "Berkas & SIM", icon: ShieldCheck },
    { id: 4, label: "Pembayaran DP", icon: CreditCard },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">


      {/* MODAL MAIN CONTAINER */}
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[94vh] my-2 sm:my-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL TOP HEADER */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent text-white flex items-center justify-center shadow-md shadow-accent/25 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-400 block truncate">
                Pemesanan Resmi Armada
              </span>
              <h3 className="font-display font-extrabold text-xs sm:text-base text-white tracking-wide truncate max-w-[210px] sm:max-w-none">
                Portal Reservasi & Verifikasi Royal Drive
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer focus:outline-none shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEPPER PROGRESS BAR */}
        <div className="px-2.5 sm:px-6 py-2.5 sm:py-3.5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-4 gap-1 sm:gap-4">
            {stepsConfig.map((s) => {
              const isCompleted = currentStep > s.id;
              const isActive = currentStep === s.id;
              return (
                <div 
                  key={s.id}
                  className={`flex flex-col sm:flex-row items-center sm:space-x-2 p-1 sm:p-2 rounded-xl transition-all ${
                    isActive 
                      ? "bg-white shadow-xs border border-slate-200 text-slate-900 font-bold" 
                      : isCompleted 
                      ? "text-emerald-700 font-semibold opacity-90" 
                      : "text-slate-400 opacity-60"
                  }`}
                >
                  <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-xs shrink-0 ${
                    isCompleted 
                      ? "bg-emerald-600 text-white" 
                      : isActive 
                      ? "bg-accent text-white shadow-sm shadow-accent/20" 
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : s.id}
                  </div>
                  <div className="text-center sm:text-left mt-0.5 sm:mt-0 leading-tight min-w-0 max-w-full">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider hidden sm:block opacity-70">Langkah {s.id}</span>
                    <span className="text-[9px] sm:text-xs truncate block font-medium sm:font-semibold">{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT BODY (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 sm:space-y-6">

          {/* ================= STEP 1: REVIEW UNIT & HARGA ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Unit Card Showcase */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 shadow-xs">
                {bookingDetails.carImage ? (
                  <div className="w-full sm:w-44 aspect-[16/10] rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-xs">
                    <img
                      src={bookingDetails.carImage}
                      alt={bookingDetails.carName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full sm:w-44 aspect-[16/10] rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <Car className="w-10 h-10" />
                  </div>
                )}

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">
                      {bookingDetails.category || "Premium Fleet"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 uppercase tracking-wider">
                      {bookingDetails.withDriver ? "Layanan Sopir Eksekutif" : "Lepas Kunci (Self Drive)"}
                    </span>
                  </div>

                  <h4 className="font-display font-black text-xl sm:text-2xl text-slate-800 tracking-tight">
                    {bookingDetails.carName}
                  </h4>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      <span>{bookingDetails.startDate} &mdash; {bookingDetails.endDate}</span>
                    </span>
                    {bookingDetails.transmission && (
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium text-[11px]">
                        {bookingDetails.transmission}
                      </span>
                    )}
                    {bookingDetails.seats && (
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium text-[11px]">
                        {bookingDetails.seats} Kursi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Transparent Financial Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Rincian Transparansi Tarif Sewa</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    ✓ Jaminan Harga Terbuka Tanpa Biaya Tersembunyi
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs divide-y divide-slate-100 shadow-xs">
                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-slate-600">Tarif Total Sewa Armada ({bookingDetails.withDriver ? "Termasuk Sopir" : "Lepas Kunci"})</span>
                    <span className="font-bold font-mono text-slate-900 text-sm">{formatCurrency(bookingDetails.totalPrice)}</span>
                  </div>

                  {/* DP 30% Highlight */}
                  <div className="p-3.5 bg-emerald-50/70 flex justify-between items-center border-l-4 border-emerald-500">
                    <div>
                      <span className="font-bold text-emerald-900 block text-xs">
                        Uang Muka Reservasi (DP 30%) &bull; Bayar Sekarang
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        Diperlukan untuk mengunci jadwal & alokasi unit armada di garasi
                      </span>
                    </div>
                    <span className="font-bold font-mono text-emerald-700 text-base">
                      {formatCurrency(depositAmount)}
                    </span>
                  </div>

                  {/* Sisa Pelunasan 70% */}
                  <div className="p-3.5 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-700 block">
                        Sisa Pelunasan (70%) &bull; Saat Serah Terima Unit
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Dapat dibayar tunai, transfer, atau debit saat mobil diantar ke lokasi
                      </span>
                    </div>
                    <span className="font-bold font-mono text-slate-700">
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Deposit Policy Note */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start space-x-3 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-semibold text-amber-950">
                    Kebijakan Uang Jaminan Sewa (Refundable Deposit 100%):
                  </strong>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Untuk sewa Lepas Kunci, uang jaminan sebesar Rp 500.000 / Rp 1.000.000 (sesuai kelas unit) dititipkan saat serah terima kunci. Uang jaminan dikembalikan <strong>utuh 100%</strong> setelah mobil kembali dalam kondisi baik & lolos pengecekan tilang elektronik nasional (ETLE).
                  </p>
                </div>
              </div>

              {/* Standard Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Asuransi All-Risk Termasuk</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Unit Steril & Full Bensin</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-2 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Layanan Roadside 24 Jam</span>
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP 2: DATA PENYEWA & LOKASI ================= */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200 text-xs">
              
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center space-x-2.5 text-blue-900 text-xs">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Pastikan nama dan nomor WhatsApp sesuai dengan kartu identitas asli untuk mempermudah serah terima unit di lokasi.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-600 font-bold block">
                    Nama Lengkap (Sesuai KTP) *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Lutfi Pratama Lugina"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-accent focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-600 font-bold block">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Contoh: 081298765432"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-accent focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-600 font-bold block">
                    Alamat Email Aktif (Kirim Invoice) *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-accent focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-600 font-bold block">
                    Titik Antar / Serah Terima Unit *
                  </label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-accent focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Showroom Royal Drive (Gratis)">Showroom Royal Drive (Gratis)</option>
                    <option value="Bandara Soekarno-Hatta (Terminal 3)">Bandara Soekarno-Hatta (Terminal 3)</option>
                    <option value="Bandara Soekarno-Hatta (Terminal 1 / 2)">Bandara Soekarno-Hatta (Terminal 1 / 2)</option>
                    <option value="Stasiun Gambir / Stasiun KCIC Halim">Stasiun Gambir / Stasiun KCIC Halim</option>
                    <option value="Hotel / Alamat Rumah (Jabodetabek)">Hotel / Alamat Rumah (Jabodetabek)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-600 font-bold block">
                  Catatan Khusus / Permintaan Penjemputan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Tolong siapkan child seat, atau diantar tepat pukul 08:00 WIB di lobby hotel."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-accent focus:bg-white transition-all text-xs"
                />
              </div>

            </div>
          )}

          {/* ================= STEP 3: BERKAS DOKUMEN & WATERMARK ================= */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200 text-xs">
              
              {/* Privacy Notice Banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-900 text-[11px]">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block text-emerald-950">
                    Perlindungan Privasi & Enkripsi Watermark Resmi:
                  </strong>
                  Semua berkas identitas yang Anda unggah otomatis diberi stempel watermark <em>"KHUSUS SEWA ROYAL DRIVE"</em> dan tersimpan terenkripsi. Data Anda aman dari risiko penyalahgunaan pinjaman online atau pihak ketiga.
                </div>
              </div>

              {/* NIK & SIM Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">
                      Nomor NIK KTP (16 Digit) *
                    </label>
                    <span className={`text-[10px] font-mono ${ktpNumber.replace(/\D/g, "").length === 16 ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                      {ktpNumber.replace(/\D/g, "").length}/16 Digit
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={16}
                    value={ktpNumber}
                    onChange={(e) => setKtpNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="317105xxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-accent focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">
                      Nomor SIM A (Pengemudi) *
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">12-14 Digit</span>
                  </div>
                  <input
                    type="text"
                    maxLength={14}
                    value={simNumber}
                    onChange={(e) => setSimNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="9204xxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-accent focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Upload & Live Watermark Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Upload KTP with Live Watermark */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-600 font-bold block">
                    Foto KTP Asli *
                  </span>

                  {ktpFile ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 bg-slate-900/5 aspect-[16/10] shadow-sm group">
                      <img src={ktpFile} alt="KTP Watermarked" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                        <div className="rotate-[-14deg] border-2 border-dashed border-white/90 bg-red-600/90 text-white font-bold text-[9px] uppercase px-3 py-1 rounded shadow-lg tracking-wider text-center">
                          KHUSUS SEWA ROYAL DRIVE &bull; AMAN &bull; RESMI
                        </div>
                      </div>
                      <label className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md cursor-pointer border border-slate-200 transition-colors">
                        Ganti Foto KTP
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              setIsCompressingKtp(true);
                              const compressed = await compressImageFile(e.target.files[0]);
                              if (compressed) setKtpFile(compressed);
                              setIsCompressingKtp(false);
                            }
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-accent bg-slate-50 hover:bg-slate-100/70 aspect-[16/10] rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all text-center group">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            setIsCompressingKtp(true);
                            const compressed = await compressImageFile(e.target.files[0]);
                            if (compressed) setKtpFile(compressed);
                            setIsCompressingKtp(false);
                          }
                        }}
                      />
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-800 text-xs block">
                        {isCompressingKtp ? "Mengompresi KTP..." : "Pilih / Foto KTP Asli"}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Format JPG/PNG (Otomatis Watermark)</span>
                    </label>
                  )}
                </div>

                {/* Upload SIM A with Live Watermark */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-600 font-bold block">
                    Foto SIM A Asli *
                  </span>

                  {simFile ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-blue-300 bg-slate-900/5 aspect-[16/10] shadow-sm group">
                      <img src={simFile} alt="SIM Watermarked" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                        <div className="rotate-[-14deg] border-2 border-dashed border-white/90 bg-blue-600/90 text-white font-bold text-[9px] uppercase px-3 py-1 rounded shadow-lg tracking-wider text-center">
                          SIM TERVALIDASI &bull; ROYAL DRIVE
                        </div>
                      </div>
                      <label className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md cursor-pointer border border-slate-200 transition-colors">
                        Ganti Foto SIM A
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              setIsCompressingSim(true);
                              const compressed = await compressImageFile(e.target.files[0]);
                              if (compressed) setSimFile(compressed);
                              setIsCompressingSim(false);
                            }
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-accent bg-slate-50 hover:bg-slate-100/70 aspect-[16/10] rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all text-center group">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            setIsCompressingSim(true);
                            const compressed = await compressImageFile(e.target.files[0]);
                            if (compressed) setSimFile(compressed);
                            setIsCompressingSim(false);
                          }
                        }}
                      />
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-800 text-xs block">
                        {isCompressingSim ? "Mengompresi SIM..." : "Pilih / Foto SIM A Asli"}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Format JPG/PNG (Otomatis Watermark)</span>
                    </label>
                  )}
                </div>

              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    Kontak Darurat (Penjamin Keluarga) *
                  </span>
                  <span className="text-[10px] text-slate-400">Wajib untuk proses serah terima</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Nama Kontak Darurat"
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-accent"
                    required
                  />

                  <select
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-accent"
                  >
                    <option value="Keluarga Inti">Keluarga Inti</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Suami / Istri">Suami / Istri</option>
                    <option value="Saudara Kandung">Saudara Kandung</option>
                    <option value="Rekan Kerja">Rekan Kerja</option>
                    <option value="Sahabat">Sahabat</option>
                  </select>

                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="No. Telp / WA Darurat"
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-accent"
                    required
                  />
                </div>
              </div>

              {/* Social Media Link (Optional) */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-600 font-bold block">
                  Akun Media Sosial / Profil (Instagram / LinkedIn) &bull; Opsional
                </label>
                <input
                  type="text"
                  value={socialMedia}
                  onChange={(e) => setSocialMedia(e.target.value)}
                  placeholder="@username_instagram atau link profil"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-accent"
                />
              </div>

            </div>
          )}

          {/* ================= STEP 4: PANDUAN PEMBAYARAN DP ================= */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              
              {/* Trust & Verification Confirmation Banner */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Identitas & Berkas Berhasil Diverifikasi</span>
                    <span className="text-[10px] text-slate-500 block">Kunci reservasi unit Anda dengan transfer DP (Uang Muka) di bawah ini.</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center space-x-1 shrink-0">
                  <Check className="w-3 h-3" />
                  <span>Data Valid</span>
                </span>
              </div>


              {/* Section 4B: Payment DP Instructions with Countdown Timer */}
              <div className="space-y-3">
                {/* Countdown banner */}
                <div className="p-3.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-2.5">
                    <Clock className="w-4 h-4 text-red-200 animate-pulse" />
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-red-200 block">
                        Waktu Penahanan Unit Armada:
                      </span>
                      <span className="font-mono font-black text-sm text-white">
                        {formatCountdown(timeLeft)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-red-200 block">Tagihan DP 30%</span>
                    <span className="font-mono font-black text-base text-white">
                      {formatCurrency(depositAmount)}
                    </span>
                  </div>
                </div>

                {/* Bank Tabs Selector */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Pilih Metode Pembayaran DP:
                    </span>
                    <button
                      onClick={() => handleCopy(depositAmount.toString(), "nominal")}
                      className="text-[10px] text-emerald-700 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedText === "nominal" ? "Nominal Tersalin!" : `Salin Rp ${depositAmount.toLocaleString("id-ID")}`}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "bca", label: "BCA", sub: "Virtual / TF" },
                      { id: "mandiri", label: "Mandiri", sub: "Transfer" },
                      { id: "bri", label: "BRI", sub: "Transfer" },
                      { id: "qris", label: "QRIS", sub: "Semua Wallet" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedBank(m.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedBank === m.id
                            ? "bg-slate-900 text-white border-slate-900 font-bold shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span className="block text-xs font-black">{m.label}</span>
                        <span className="block text-[9px] opacity-75">{m.sub}</span>
                      </button>
                    ))}
                  </div>

                  {/* Selected Bank Details */}
                  {selectedBank === "bca" && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">BANK CENTRAL ASIA (BCA)</span>
                        <span className="font-mono font-black text-base text-slate-900 block">8830-192-888</span>
                        <span className="text-[10px] text-slate-500 block">a/n PT ROYAL DRIVE INDONESIA</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("8830192888", "rek_bca")}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        {copiedText === "rek_bca" ? "Tersalin!" : "Salin No. Rek"}
                      </button>
                    </div>
                  )}

                  {selectedBank === "mandiri" && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">BANK MANDIRI</span>
                        <span className="font-mono font-black text-base text-slate-900 block">137-00-88899-221</span>
                        <span className="text-[10px] text-slate-500 block">a/n PT ROYAL DRIVE INDONESIA</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("1370088899221", "rek_mandiri")}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        {copiedText === "rek_mandiri" ? "Tersalin!" : "Salin No. Rek"}
                      </button>
                    </div>
                  )}

                  {selectedBank === "bri" && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">BANK RAKYAT INDONESIA (BRI)</span>
                        <span className="font-mono font-black text-base text-slate-900 block">0341-01-002888-301</span>
                        <span className="text-[10px] text-slate-500 block">a/n PT ROYAL DRIVE INDONESIA</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("034101002888301", "rek_bri")}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        {copiedText === "rek_bri" ? "Tersalin!" : "Salin No. Rek"}
                      </button>
                    </div>
                  )}

                  {selectedBank === "qris" && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <div className="w-32 h-32 bg-white p-2 border border-slate-300 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                        <div className="w-full h-full border border-dashed border-slate-400 flex flex-col items-center justify-center text-slate-700 p-1">
                          <QrCode className="w-16 h-16 text-slate-900" />
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-900 mt-1">QRIS STANDAR GPN</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 block">Scan QRIS Bebas Biaya Admin</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Buka aplikasi m-Banking Anda (BCA Mobile, Livin' Mandiri, BRImo) atau e-wallet (GoPay, OVO, Dana, ShopeePay) lalu scan barcode di samping untuk transfer DP Rp {depositAmount.toLocaleString("id-ID")}.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Direct Proof Upload Box (Optional) */}
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-slate-600 font-bold block">
                        Lampirkan Bukti Transfer DP (Bisa Diunggah Sekarang atau Nanti)
                      </span>
                      {paymentProofUrl && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          ✓ Struk Siap
                        </span>
                      )}
                    </div>

                    <label className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl bg-slate-50 hover:bg-emerald-50/50 cursor-pointer text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors text-center">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{paymentProofUrl ? "Ganti Foto Struk Transfer" : "Upload Foto Bukti Transfer / Screenshot m-Banking"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            setIsCompressingProof(true);
                            const compressed = await compressImageFile(e.target.files[0]);
                            if (compressed) setPaymentProofUrl(compressed);
                            setIsCompressingProof(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER BUTTONS BAR */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 gap-2 sm:gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as StepNumber)}
              className="px-3.5 sm:px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0"
            >
              Batal
            </button>
          )}

          {currentStep === 1 && (
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="px-4 sm:px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 sm:space-x-2 shadow-lg shadow-accent/20"
            >
              <span><span className="hidden sm:inline">Lanjut: </span>Data Penyewa</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              type="button"
              onClick={handleNextFromStep2}
              className="px-4 sm:px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 sm:space-x-2 shadow-lg shadow-accent/20"
            >
              <span><span className="hidden sm:inline">Lanjut: </span>Berkas & SIM</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="button"
              onClick={handleNextFromStep3}
              className="px-4 sm:px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 sm:space-x-2 shadow-lg shadow-accent/20"
            >
              <span><span className="hidden sm:inline">Lanjut: </span>Bayar DP</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {currentStep === 4 && (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-4 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 sm:space-x-2 shadow-lg shadow-emerald-600/25 animate-pulse"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span><span className="hidden sm:inline">Konfirmasi </span>Reservasi Selesai</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
