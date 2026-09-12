"use client";

import { useState, useEffect } from "react";
import { 
  Search, X, CheckCircle2, Clock, AlertCircle, Car, Calendar, 
  MapPin, Phone, CreditCard, ShieldCheck, Printer, MessageSquare, 
  FileText, Check, ChevronRight, User, Upload, Sparkles, ExternalLink,
  FileSignature, Receipt, ArrowRight, Gauge, Fuel
} from "lucide-react";
import { BookingRecord, terbilangRupiah } from "./AdminDashboard";
import { formatRupiah } from "../data/cars";

interface BookingTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  initialBookingId?: string;
  brandName?: string;
  showroomAddress?: string;
}

export default function BookingTrackerModal({
  isOpen,
  onClose,
  whatsappNumber,
  initialBookingId,
  brandName = "Royal Drive",
  showroomAddress = "Jl. Boulevard Barat Raya Blok LC7 No. 12, Kelapa Gading, Jakarta Utara",
}: BookingTrackerModalProps) {
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [phoneDigitsInput, setPhoneDigitsInput] = useState("");
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSpkModal, setShowSpkModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");

  const loadAndFindBooking = async (searchBookingId: string, searchPhoneLast4: string = "") => {
    const trimmedId = searchBookingId.trim().toUpperCase();
    const trimmedDigits = searchPhoneLast4.trim().replace(/\D/g, "");

    if (!trimmedId) {
      setErrorMsg("Silakan masukkan Nomor Booking resmi (contoh: BK-9812).");
      setActiveBooking(null);
      return;
    }

    try {
      let allBookings: BookingRecord[] = [];
      const saved = localStorage.getItem("royal_drive_bookings_v2");
      if (saved) {
        try {
          allBookings = JSON.parse(saved);
        } catch {
          allBookings = [];
        }
      }

      // Also fetch and merge from centralized server API so cross-device bookings can be tracked!
      try {
        const res = await fetch("/api/bookings?t=" + Date.now(), { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.bookings)) {
            const serverBookings = data.bookings as BookingRecord[];
            const map = new Map<string, BookingRecord>();
            allBookings.forEach((b) => map.set(b.id, b));
            serverBookings.forEach((b) => map.set(b.id, b));
            allBookings = Array.from(map.values());
          }
        }
      } catch {
        // Continue with local storage bookings
      }

      const match = allBookings.find((b) => {
        const idMatches = b.id.trim().toUpperCase() === trimmedId;
        if (!idMatches) return false;
        if (trimmedDigits) {
          const cleanPhone = b.phone.replace(/\D/g, "");
          return cleanPhone.endsWith(trimmedDigits);
        }
        return true;
      });

      setSearched(true);
      if (match) {
        // If searched manually without 4 phone digits and not coming from immediate booking link
        if (!trimmedDigits && !initialBookingId) {
          setActiveBooking(null);
          setErrorMsg("Demi keamanan privasi data penyewa (UU PDP), masukkan 4 digit terakhir nomor WhatsApp terdaftar untuk memverifikasi kepemilikan pesanan.");
          return;
        }
        setActiveBooking(match);
        setErrorMsg("");
      } else {
        setActiveBooking(null);
        setErrorMsg(`Tidak ditemukan pesanan dengan No. Booking "${trimmedId}" dan 4 digit No. HP "${trimmedDigits || '-'}". Pastikan kombinasi data Anda benar.`);
      }
    } catch {
      setErrorMsg("Terjadi kesalahan saat memuat data pesanan.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialBookingId) {
        setBookingIdInput(initialBookingId);
        loadAndFindBooking(initialBookingId);
      } else {
        setBookingIdInput("");
        setPhoneDigitsInput("");
        setActiveBooking(null);
        setSearched(false);
        setErrorMsg("");
      }
    }
  }, [isOpen, initialBookingId]);

  // Live auto-sync: Automatically update booking details if admin on laptop approves/assigns driver
  useEffect(() => {
    if (!isOpen || !activeBooking?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/bookings?t=" + Date.now(), { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.bookings)) {
            const updated = data.bookings.find((b: BookingRecord) => b.id === activeBooking.id);
            if (updated && JSON.stringify(updated) !== JSON.stringify(activeBooking)) {
              setActiveBooking(updated);
            }
          }
        }
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, activeBooking]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAndFindBooking(bookingIdInput, phoneDigitsInput);
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeBooking) {
      try {
        setIsUploadingProof(true);
        const file = e.target.files[0];
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (readerEvent) => {
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;
              const maxDim = 800;
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
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.75));
              } else {
                resolve(readerEvent.target?.result as string);
              }
            };
            img.onerror = () => resolve(readerEvent.target?.result as string);
            img.src = readerEvent.target?.result as string;
          };
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        });

        if (!dataUrl) {
          setIsUploadingProof(false);
          return;
        }

        const timeStr = `${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}, ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
        const updated: BookingRecord = {
          ...activeBooking,
          paymentProofUrl: dataUrl,
          paymentProofTime: timeStr,
        };

        setActiveBooking(updated);
        setUploadSuccessMsg("Bukti transfer berhasil diunggah dan disinkronkan ke kasir showroom!");
        setTimeout(() => setUploadSuccessMsg(""), 4500);

        // 1. Sync to local storage
        try {
          const saved = localStorage.getItem("royal_drive_bookings_v2");
          if (saved) {
            const list: BookingRecord[] = JSON.parse(saved);
            const updatedList = list.map((b) => (b.id === activeBooking.id ? updated : b));
            localStorage.setItem("royal_drive_bookings_v2", JSON.stringify(updatedList));
          }
        } catch {}

        // 2. Sync to centralized server API
        try {
          await fetch("/api/bookings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookings: [updated] }),
          });
        } catch (err) {
          console.error("Failed to sync booking proof to server:", err);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploadingProof(false);
      }
    }
  };

  const formatCurrency = (val: number) => formatRupiah(val);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
        <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-left my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="p-6 md:p-8 bg-slate-900 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer focus:outline-none print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-900/40">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  Portal Pelanggan &bull; Verifikasi 2-Faktor Aman
                </span>
                <h2 className="font-display font-black text-xl md:text-2xl text-white">
                  Lacak Status Booking & Armada
                </h2>
              </div>
            </div>
            <p className="text-slate-400 text-xs font-light max-w-xl">
              Pantau status verifikasi dokumen KTP, konfirmasi pembayaran DP, kesiapan unit, serta kontak sopir bertugas secara real-time.
            </p>

            {/* Secure 2-Factor Search Form */}
            <form onSubmit={handleSearchSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-2 print:hidden">
              <div className="relative sm:col-span-6">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={bookingIdInput}
                  onChange={(e) => setBookingIdInput(e.target.value.toUpperCase())}
                  placeholder="No. Booking (contoh: BK-3932)"
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <div className="relative sm:col-span-3">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={4}
                  value={phoneDigitsInput}
                  onChange={(e) => setPhoneDigitsInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="4 Digit No. WA"
                  className="w-full pl-9 pr-3 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-400 text-xs focus:outline-none focus:border-red-500 transition-colors"
                  title="Masukkan 4 digit terakhir nomor WhatsApp pemesan"
                />
              </div>
              <button
                type="submit"
                className="sm:col-span-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-red-900/30"
              >
                <span>Cari Pesanan</span>
              </button>
            </form>

            {/* Quick Demo Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-[10px] text-slate-400 print:hidden">
              <span>Uji Cepat:</span>
              {[
                { id: "BK-3932", last4: "6679", label: "Aktif & DP Lunas" },
                { id: "BK-9959", last4: "6679", label: "Aktif & Struk DP" },
                { id: "BK-9812", last4: "5432", label: "Pending" },
                { id: "BK-9801", last4: "5678", label: "Lunas" },
              ].map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setBookingIdInput(sample.id);
                    setPhoneDigitsInput(sample.last4);
                    loadAndFindBooking(sample.id, sample.last4);
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] font-mono transition-colors cursor-pointer border border-slate-700"
                >
                  {sample.id} ({sample.last4})
                </button>
              ))}
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-800">
            
            {errorMsg && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Data Tidak Ditemukan</strong>
                  <p className="mt-0.5 text-amber-700">{errorMsg}</p>
                </div>
              </div>
            )}

            {!searched && !activeBooking && (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Car className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-sm text-slate-700">
                  Belum Ada Pencarian
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Ketikkan nomor registrasi booking resmi Anda dan 4 digit terakhir nomor WhatsApp terdaftar untuk melihat progres kesiapan armada.
                </p>
              </div>
            )}

            {activeBooking && (
              <div className="space-y-6">

                {/* Status Header Bar */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-lg text-slate-900">
                        {activeBooking.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activeBooking.status === "Active" 
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : activeBooking.status === "Completed"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {activeBooking.status === "Active" 
                          ? "Sedang Digunakan" 
                          : activeBooking.status === "Completed" 
                          ? "Sewa Selesai" 
                          : "Menunggu Penyerahan"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Penyewa: <strong>{activeBooking.client}</strong> &bull; Didaftarkan: {activeBooking.date}
                    </span>
                  </div>

                  {/* Document & Quick Actions Buttons */}
                  <div className="flex flex-wrap items-center gap-2 print:hidden">
                    <button
                      type="button"
                      onClick={() => setShowSpkModal(true)}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                      title="Lihat Surat Perjanjian Sewa (SPK)"
                    >
                      <FileSignature className="w-3.5 h-3.5" />
                      <span>SPK Digital</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInvoiceModal(true)}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                      title="Lihat e-Invoice & Kuitansi Pembayaran"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>e-Invoice</span>
                    </button>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Halo Admin ${brandName}, saya ingin konfirmasi pesanan saya dengan No. Booking: ${activeBooking.id} (${activeBooking.car}).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-white" />
                      <span>Chat CS</span>
                    </a>
                  </div>
                </div>

                {/* 5-Stage Live Timeline Stepper */}
                <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tahapan Operasional & Kesiapan Armada
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Real-Time Sync Aktif
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-2">
                    {/* Step 1: Reservasi */}
                    <div className="flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 sm:space-y-1.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-700 shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">1. Reservasi</span>
                        <span className="text-[10px] text-emerald-600 font-medium">Tercatat Sistem</span>
                      </div>
                    </div>

                    {/* Step 2: KYC KTP/SIM */}
                    <div className="flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 sm:space-y-1.5">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        activeBooking.documents?.verified 
                          ? "bg-emerald-100 border-emerald-500 text-emerald-700" 
                          : "bg-amber-50 border-amber-400 text-amber-600"
                      }`}>
                        {activeBooking.documents?.verified ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">2. Berkas KYC</span>
                        <span className={`text-[10px] font-medium ${
                          activeBooking.documents?.verified ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {activeBooking.documents?.verified ? "Dokumen Sah" : "Ditinjau Admin"}
                        </span>
                      </div>
                    </div>

                    {/* Step 3: Pembayaran DP */}
                    <div className="flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 sm:space-y-1.5">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        activeBooking.paymentStatus === "Lunas" || activeBooking.paymentStatus === "DP Lunas"
                          ? "bg-emerald-100 border-emerald-500 text-emerald-700" 
                          : activeBooking.paymentProofUrl
                          ? "bg-blue-50 border-blue-400 text-blue-600"
                          : "bg-amber-50 border-amber-400 text-amber-600"
                      }`}>
                        {activeBooking.paymentStatus === "Lunas" || activeBooking.paymentStatus === "DP Lunas" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">3. Pembayaran DP</span>
                        <span className={`text-[10px] font-medium ${
                          activeBooking.paymentStatus === "Lunas" 
                            ? "text-emerald-600" 
                            : activeBooking.paymentStatus === "DP Lunas"
                            ? "text-emerald-600"
                            : activeBooking.paymentProofUrl
                            ? "text-blue-600"
                            : "text-amber-600"
                        }`}>
                          {activeBooking.paymentStatus === "Lunas" 
                            ? "Lunas" 
                            : activeBooking.paymentStatus === "DP Lunas"
                            ? "DP Terverifikasi"
                            : activeBooking.paymentProofUrl
                            ? "Menunggu Validasi"
                            : "Menunggu DP"}
                        </span>
                      </div>
                    </div>

                    {/* Step 4: Driver / Kesiapan Unit */}
                    <div className="flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 sm:space-y-1.5">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        activeBooking.driverName || activeBooking.status === "Active" || activeBooking.status === "Completed"
                          ? "bg-emerald-100 border-emerald-500 text-emerald-700"
                          : "bg-slate-100 border-slate-300 text-slate-400"
                      }`}>
                        {activeBooking.driverName || activeBooking.status === "Active" || activeBooking.status === "Completed" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Car className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">4. Unit & Sopir</span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {activeBooking.driverName 
                            ? "Sopir Ditugaskan" 
                            : activeBooking.status === "Active" || activeBooking.status === "Completed"
                            ? "Armada Siap"
                            : "Persiapan Pool"}
                        </span>
                      </div>
                    </div>

                    {/* Step 5: Penyerahan Unit & Selesai */}
                    <div className="flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 sm:space-y-1.5">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        activeBooking.status === "Completed"
                          ? "bg-emerald-100 border-emerald-500 text-emerald-700"
                          : activeBooking.status === "Active"
                          ? "bg-blue-100 border-blue-500 text-blue-700 animate-pulse"
                          : "bg-slate-100 border-slate-300 text-slate-400"
                      }`}>
                        {activeBooking.status === "Completed" ? (
                          <Check className="w-4 h-4" />
                        ) : activeBooking.status === "Active" ? (
                          <Car className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">5. Penggunaan</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {activeBooking.status === "Active" 
                            ? "Sedang Berjalan" 
                            : activeBooking.status === "Completed"
                            ? "Selesai & Aman"
                            : "Menunggu Jadwal"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Profile Card (Shown if driver assigned) */}
                {activeBooking.driverName && (
                  <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-red-400 font-bold uppercase tracking-wider text-[10px]">
                        <User className="w-3.5 h-3.5" />
                        <span>Petugas Pengemudi & Armada Ditugaskan</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[9px] font-bold">
                        ● Sopir Siap Melayani
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Nama Sopir:</span>
                        <span className="font-bold text-sm text-white block">{activeBooking.driverName}</span>
                        {activeBooking.driverPhone && (
                          <span className="text-xs text-slate-300 font-mono block mt-0.5">{activeBooking.driverPhone}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Jadwal Penjemputan:</span>
                        <span className="font-bold text-sm text-amber-300 block">{activeBooking.driverPickupTime || "Sesuai Jadwal Reservasi"}</span>
                        <span className="text-[10px] text-slate-300 block mt-0.5">Plat Nomor: <strong className="text-white font-mono">{activeBooking.carPlate}</strong></span>
                      </div>
                    </div>

                    {activeBooking.driverNotes && (
                      <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300">
                        <span className="text-slate-400 font-semibold text-[10px] block mb-0.5">Catatan Khusus Operasional:</span>
                        <p className="italic leading-relaxed">&ldquo;{activeBooking.driverNotes}&rdquo;</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {activeBooking.driverPhone && (
                        <>
                          <a
                            href={`https://wa.me/${activeBooking.driverPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Halo Bpk ${activeBooking.driverName}, saya penyewa unit ${activeBooking.car} (${activeBooking.carPlate}) dengan No. Booking ${activeBooking.id}. Mohon konfirmasi posisi penjemputan.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[140px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-white" />
                            <span>Chat WhatsApp Sopir</span>
                          </a>
                          <a
                            href={`tel:${activeBooking.driverPhone.replace(/\D/g, "")}`}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Telepon</span>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Vehicle Inspection Result (Handover Checklist) */}
                {activeBooking.inspection?.checkOut && (
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-emerald-800 font-bold uppercase tracking-wider text-[10px]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Hasil Inspeksi Serah Terima Kendaraan (Check-Out)</span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-[9px] font-bold">
                        ✓ Fisik Terverifikasi
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                        <span className="text-slate-400 text-[9px] block">Odometer Awal</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {activeBooking.inspection.checkOut.odometer.toLocaleString("id-ID")} KM
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                        <span className="text-slate-400 text-[9px] block">Indikator BBM</span>
                        <span className="font-bold text-emerald-700 text-xs">
                          {activeBooking.inspection.checkOut.fuelLevel}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100 sm:col-span-2">
                        <span className="text-slate-400 text-[9px] block">Petugas Checker & Waktu</span>
                        <span className="font-medium text-slate-800 text-[11px] truncate block">
                          {activeBooking.inspection.checkOut.inspector} ({activeBooking.inspection.checkOut.time})
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-[11px] text-slate-700">
                      <span className="text-slate-400 text-[10px] block mb-0.5 font-semibold">Kondisi Fisik & Bodi Unit:</span>
                      <p className="text-slate-800 font-medium">
                        {activeBooking.inspection.checkOut.scratches || "Kondisi bodi bersih & mulus, tanpa ada baret baru."}
                      </p>
                    </div>

                    {activeBooking.inspection?.checkIn && (
                      <div className="p-2.5 bg-emerald-100/60 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex justify-between items-center">
                        <span>Pengembalian unit selesai ({activeBooking.inspection.checkIn.time})</span>
                        <span className="font-mono font-bold">Odo Akhir: {activeBooking.inspection.checkIn.odometer.toLocaleString("id-ID")} KM</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Car & Service Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Car details */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <Car className="w-3.5 h-3.5 text-red-600" />
                      <span>Unit & Kendaraan</span>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-slate-900">
                        {activeBooking.car}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="px-2.5 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded-md">
                          {activeBooking.carPlate}
                        </span>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10px] rounded-md font-semibold">
                          {activeBooking.rentalType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule & Pickup */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <Calendar className="w-3.5 h-3.5 text-red-600" />
                      <span>Jadwal & Lokasi</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {activeBooking.startDate} s/d {activeBooking.endDate}
                      </span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Durasi: {activeBooking.durationDays} Hari
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-start space-x-2 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{activeBooking.pickupLocation || "Showroom Royal Drive"}</span>
                    </div>
                  </div>

                </div>

                {/* Financial Breakdown */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <CreditCard className="w-3.5 h-3.5 text-red-600" />
                      <span>Rincian Finansial & Tagihan</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                      Metode: Transfer Bank / QRIS
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">Total Biaya Sewa</span>
                      <span className="font-bold text-slate-900 text-sm">{formatCurrency(activeBooking.totalPrice)}</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-emerald-700 text-[10px] block">Uang Muka (DP 30%)</span>
                      <span className="font-bold text-emerald-800 text-sm">{formatCurrency(activeBooking.depositAmount)}</span>
                    </div>
                    <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                      <span className="text-red-700 text-[10px] block">Sisa Pelunasan</span>
                      <span className="font-bold text-red-800 text-sm">
                        {formatCurrency(Math.max(0, activeBooking.totalPrice - (activeBooking.paymentStatus === "Lunas" ? activeBooking.totalPrice : activeBooking.depositAmount)))}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    *Sisa pelunasan dan uang jaminan dapat diserahkan saat inspeksi serah-terima kunci armada berlangsung.
                  </p>
                </div>

                {/* Security Deposit Tracker for Lepas Kunci */}
                {activeBooking.rentalType === "Lepas Kunci" && (
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                        <span>Status Uang Jaminan (Security Deposit)</span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        activeBooking.securityDepositStatus === "Refund Selesai"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : activeBooking.securityDepositStatus === "Pemeriksaan ETLE"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : activeBooking.securityDepositStatus === "Dipotong Denda"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {activeBooking.securityDepositStatus || "Ditahan Selama Sewa"}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border space-y-2.5 bg-slate-50 border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Nominal Deposit Jaminan:</span>
                        <span className="font-extrabold text-slate-900 font-display">
                          {formatCurrency(activeBooking.securityDepositAmount || 1000000)}
                        </span>
                      </div>

                      {/* Status Details */}
                      {activeBooking.securityDepositStatus === "Refund Selesai" ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 space-y-1">
                          <span className="font-bold block flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1" />
                            <span>Dana Deposit Berhasil Ditransfer Balik</span>
                          </span>
                          <p className="text-[10px] text-emerald-700 leading-relaxed">
                            Unit mobil dinyatakan bebas dari pelanggaran kamera tilang ETLE & tidak ada kerusakan baru. Dana sebesar <strong>{formatCurrency(activeBooking.securityDepositAmount || 1000000)}</strong> telah dikirim ke rekening <strong>{activeBooking.refundBankName} {activeBooking.refundAccountNumber} a/n {activeBooking.refundAccountName}</strong> pada {activeBooking.refundDate || "hari ini"}.
                          </p>
                        </div>
                      ) : activeBooking.securityDepositStatus === "Pemeriksaan ETLE" ? (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-800 space-y-1">
                          <span className="font-bold block flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-blue-600 inline mr-1" />
                            <span>Pemeriksaan Tilang ETLE Berjalan (Maks. 1x24 Jam)</span>
                          </span>
                          <p className="text-[10px] text-blue-700 leading-relaxed">
                            Mobil telah berhasil dikembalikan ke showroom. Sesuai SOP rental kendaraan nasional, proses refund deposit membutuhkan waktu 1x24 jam untuk sinkronisasi database kamera tilang elektronik Korlantas Polri.
                          </p>
                        </div>
                      ) : activeBooking.securityDepositStatus === "Dipotong Denda" ? (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 space-y-1.5">
                          <span className="font-bold block flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4 text-rose-600 inline mr-1" />
                            <span>Deposit Dikembalikan Sebagian (Dipotong Denda/Kerusakan)</span>
                          </span>
                          <div className="text-[10px] text-rose-700 space-y-0.5">
                            <p>Potongan: <strong>{formatCurrency(activeBooking.refundDeductionAmount || 0)}</strong></p>
                            <p>Keterangan: <em>&ldquo;{activeBooking.refundDeductionReason || "Pelanggaran aturan lalu lintas / perbaikan unit"}&rdquo;</em></p>
                            <p>Sisa Dana Ditransfer: <strong>{formatCurrency(Math.max(0, (activeBooking.securityDepositAmount || 1000000) - (activeBooking.refundDeductionAmount || 0)))}</strong></p>
                            <p>Rekening Tujuan: {activeBooking.refundBankName} {activeBooking.refundAccountNumber} a/n {activeBooking.refundAccountName}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 space-y-1">
                          <span className="font-bold block flex items-center space-x-1">
                            <ShieldCheck className="w-4 h-4 text-amber-600 inline mr-1" />
                            <span>Deposit Jaminan Ditahan Selama Masa Sewa</span>
                          </span>
                          <p className="text-[10px] text-amber-700 leading-relaxed">
                            Uang jaminan disimpan aman oleh manajemen showroom selama unit mobil Anda gunakan, dan akan diproses pengembaliannya H+1 setelah unit dikembalikan dalam kondisi baik.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Proof Status / Upload (Synced Real-Time via PUT) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <Upload className="w-4 h-4 text-red-600" />
                      <span>Bukti Transfer Pembayaran DP</span>
                    </span>
                    {activeBooking.paymentProofUrl ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        ✓ Bukti Terkirim {activeBooking.paymentProofTime ? `(${activeBooking.paymentProofTime})` : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        Menunggu Bukti Transfer
                      </span>
                    )}
                  </div>

                  {uploadSuccessMsg && (
                    <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{uploadSuccessMsg}</span>
                    </div>
                  )}

                  {activeBooking.paymentProofUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                          <img src={activeBooking.paymentProofUrl} alt="Bukti Transfer" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 text-[11px]">
                          <span className="font-semibold text-slate-800 block">Struk / Screenshot Berhasil Disimpan</span>
                          <span className="text-slate-500 text-[10px] block mt-0.5">
                            Status Validasi: {activeBooking.paymentStatus === "Belum Bayar" ? "Sedang Ditinjau Tim Kasir" : "Pembayaran Terverifikasi"}
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            Tersimpan di server cloud &bull; Terupdate otomatis di dashboard kasir
                          </span>
                        </div>
                      </div>

                      {/* Option to replace receipt */}
                      <div className="flex items-center justify-end">
                        <label className="text-[11px] text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer flex items-center space-x-1">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingProof ? "Mengunggah..." : "Ganti / Unggah Ulang Bukti Transfer"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadProof}
                            disabled={isUploadingProof}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 hover:border-red-500 bg-white p-4 rounded-xl text-center cursor-pointer transition-colors relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadProof}
                        disabled={isUploadingProof}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center space-y-1 text-slate-500">
                        <Upload className="w-5 h-5 text-red-600" />
                        <span className="text-xs text-slate-700 font-medium">
                          {isUploadingProof ? "Memproses Kompresi & Sinkronisasi..." : "Unggah Bukti Transfer Sekarang"}
                        </span>
                        <span className="text-[10px] text-slate-400">Pilih foto struk ATM atau tangkapan layar m-Banking (Auto-Kompresi & Sinkron Otomatis)</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
            <span className="text-[11px] text-slate-500">
              Butuh bantuan darurat? Hubungi hotline 24/7 kami di <strong className="text-slate-800">0812-8888-9999</strong>
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: SURAT PERJANJIAN SEWA KENDARAAN (SPK DIGITAL) */}
      {/* ======================================================== */}
      {showSpkModal && activeBooking && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white font-serif">
          <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
            
            {/* Action Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden font-sans">
              <div className="flex items-center space-x-2">
                <FileSignature className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Surat Perjanjian Sewa Menyewa Mobil (SPSM)
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    SPK/RD/{new Date().getFullYear()}/{activeBooking.id}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSpkModal(false)}
                  className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SPK Printable Content */}
            <div className="p-6 sm:p-10 overflow-y-auto text-left text-slate-800 space-y-5 leading-relaxed bg-white">
              <div className="text-center border-b-2 border-slate-900 pb-3 font-sans">
                <h2 className="font-black text-xl tracking-wider text-slate-900 uppercase">
                  {brandName} CAR RENTAL INDONESIA
                </h2>
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 mt-0.5">
                  SURAT PERJANJIAN SEWA MENYEWA KENDARAAN (SPSM)
                </h3>
                <p className="font-mono text-[10px] text-slate-500 mt-1">
                  Nomor: SPK/RD/{new Date().getFullYear()}/{activeBooking.id}
                </p>
              </div>

              <p className="text-xs text-justify">
                Pada hari ini, tanggal <strong>{activeBooking.date}</strong>, telah disepakati dan dibuat perjanjian sewa menyewa kendaraan antara:
              </p>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 font-sans text-xs space-y-2">
                <div>
                  <strong className="block text-slate-900">1. PIHAK PERTAMA (Pemberi Sewa):</strong>
                  <p className="text-slate-600">{brandName} Car Rental Indonesia, berkedudukan di {showroomAddress}, bertindak sebagai pemilik dan pengelola sah armada kendaraan.</p>
                </div>
                <div>
                  <strong className="block text-slate-900">2. PIHAK KEDUA (Penyewa):</strong>
                  <p className="text-slate-600">Nama: <strong>{activeBooking.client}</strong> | NIK KTP: <strong>{activeBooking.documents?.ktpNumber || "3171xxxxxxxxxxxx"}</strong> | No. SIM: <strong>{activeBooking.documents?.simNumber || "1234xxxxxxxx"}</strong> | No. HP: <strong>{activeBooking.phone}</strong>.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs font-serif">
                <div>
                  <h4 className="font-sans font-bold text-slate-900 uppercase text-[11px]">Pasal 1: Objek dan Biaya Sewa</h4>
                  <p className="text-slate-700 text-justify">
                    PIHAK PERTAMA menyewakan kepada PIHAK KEDUA 1 (satu) unit kendaraan <strong>{activeBooking.car}</strong> dengan Nomor Polisi <strong>{activeBooking.carPlate}</strong> selama <strong>{activeBooking.durationDays} hari</strong> ({activeBooking.startDate} s/d {activeBooking.endDate}) dengan total nilai sewa <strong>{formatCurrency(activeBooking.totalPrice)}</strong>.
                  </p>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-slate-900 uppercase text-[11px]">Pasal 2: Keamanan & Tanggung Jawab Kerusakan</h4>
                  <p className="text-slate-700 text-justify">
                    PIHAK KEDUA bertanggung jawab penuh menjaga keutuhan kendaraan. Segala kerusakan bodi, ban, pecah kaca, atau kehilangan perlengkapan selama masa sewa menjadi beban PIHAK KEDUA sesuai klaim asuransi per kejadian dan biaya perbaikan riil bengkel rekanan resmi.
                  </p>
                </div>

                <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded-r-xl font-sans">
                  <h4 className="font-bold text-red-900 uppercase text-[11px]">Pasal 3: Larangan Penggadaian & Sanksi Pidana</h4>
                  <p className="text-red-800 text-justify text-[11px] mt-0.5">
                    KENDARAAN DILENGKAPI SISTEM GPS TRACKER REALTIME 24 JAM. PIHAK KEDUA DILARANG KERAS memindahtangankan, menyewakan kembali, atau MENGGADAIKAN kendaraan. Segala bentuk penggelapan akan langsung diproses secara HUKUM PIDANA berdasarkan <strong>Pasal 372 dan Pasal 378 KUHP</strong>.
                  </p>
                </div>

                <div>
                  <h4 className="font-sans font-bold text-slate-900 uppercase text-[11px]">Pasal 4: Tilang Elektronik (ETLE) & Overtime</h4>
                  <p className="text-slate-700 text-justify">
                    Pelanggaran kamera tilang elektronik (ETLE) selama periode sewa sepenuhnya merupakan tanggung jawab PIHAK KEDUA. Keterlambatan pengembalian unit dikenakan denda overcharge sebesar Rp 150.000,- per jam keterlambatan.
                  </p>
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 gap-8 pt-6 font-sans text-xs text-center border-t border-slate-200">
                <div className="space-y-12">
                  <span className="block font-bold text-slate-800">PIHAK PERTAMA (Rental)</span>
                  <div className="border-b border-slate-400 w-36 mx-auto" />
                  <span className="block text-slate-600">Manajemen {brandName}</span>
                </div>
                <div className="space-y-12">
                  <span className="block font-bold text-slate-800">PIHAK KEDUA (Penyewa)</span>
                  <div className="border-b border-slate-400 w-36 mx-auto" />
                  <span className="block text-slate-600">{activeBooking.client}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: OFFICIAL E-INVOICE & KUITANSI RESMI */}
      {/* ======================================================== */}
      {showInvoiceModal && activeBooking && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white font-sans">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
            
            {/* Action Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Official e-Invoice & Kuitansi Pembayaran
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    INV/RD/{new Date().getFullYear()}/{activeBooking.id}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Invoice Printable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto text-left text-slate-800 space-y-5 bg-white">
              
              {/* Company Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-display font-black text-xl text-slate-900 tracking-tight">{brandName}</h2>
                  <p className="text-xs text-slate-500">{showroomAddress}</p>
                  <p className="text-xs text-slate-500">WhatsApp: {whatsappNumber} &bull; Web: www.royaldrive.id</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block">INVOICE SEWA</span>
                  <span className="font-mono font-bold text-sm text-slate-900 block">INV/{new Date().getFullYear()}/{activeBooking.id}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Tanggal: {activeBooking.date}</span>
                </div>
              </div>

              {/* Client & Booking Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Ditagihkan Kepada:</span>
                  <h4 className="font-bold text-sm text-slate-900">{activeBooking.client}</h4>
                  <p className="text-xs text-slate-600">WhatsApp: {activeBooking.phone}</p>
                  <p className="text-xs text-slate-600">Email: {activeBooking.email || "-"}</p>
                  <p className="text-xs text-slate-500 mt-1">Lokasi Jemput: {activeBooking.pickupLocation || "Showroom"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Detail Jadwal:</span>
                  <span className="font-bold text-slate-800 block">{activeBooking.startDate} s/d {activeBooking.endDate}</span>
                  <span className="text-slate-600 text-xs block mt-0.5">Durasi: <strong>{activeBooking.durationDays} Hari</strong></span>
                  <span className="text-slate-600 text-xs block mt-0.5">Paket: <strong>{activeBooking.rentalType}</strong></span>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    activeBooking.paymentStatus === "Lunas" 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {activeBooking.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Deskripsi Armada</th>
                      <th className="p-3 text-center">Durasi</th>
                      <th className="p-3 text-right">Tarif / Hari</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{activeBooking.car}</span>
                        <span className="text-[10px] text-slate-500">Plat: {activeBooking.carPlate} &bull; {activeBooking.rentalType}</span>
                      </td>
                      <td className="p-3 text-center">{activeBooking.durationDays} Hari</td>
                      <td className="p-3 text-right">{formatCurrency(Math.round(activeBooking.totalPrice / (activeBooking.durationDays || 1)))}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(activeBooking.totalPrice)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total & Terbilang */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                <div className="text-[11px] text-slate-600 italic max-w-sm">
                  # {terbilangRupiah(activeBooking.totalPrice)} #
                </div>
                <div className="space-y-1 text-right w-full sm:w-auto">
                  <div className="flex justify-between sm:justify-end gap-6 text-xs text-slate-600">
                    <span>Total Tarif:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(activeBooking.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-6 text-xs text-emerald-700">
                    <span>Uang Muka (DP):</span>
                    <span className="font-bold">{formatCurrency(activeBooking.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-6 text-sm text-red-700 font-black border-t border-slate-200 pt-1">
                    <span>Sisa Pelunasan:</span>
                    <span>{formatCurrency(Math.max(0, activeBooking.totalPrice - (activeBooking.paymentStatus === "Lunas" ? activeBooking.totalPrice : activeBooking.depositAmount)))}</span>
                  </div>
                </div>
              </div>

              {/* Official Stamp Footer */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs">
                <div className="p-2 border border-dashed border-emerald-400 bg-emerald-50 rounded-lg text-[10px] text-emerald-800 font-mono">
                  ✓ VERIFIED DIGITAL INVOICE &bull; {brandName.toUpperCase()}
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Finance Department</span>
                  <span className="font-bold text-slate-800 block">PT ROYAL DRIVE INDONESIA</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
