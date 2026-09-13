"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, Copy, Check, MessageSquare, Printer, Calendar, 
  Car, ShieldCheck, MapPin, CreditCard, ChevronRight, X, Upload, 
  Image as ImageIcon, Clock, QrCode, Phone, Sparkles
} from "lucide-react";
import { BookingRecord } from "./AdminDashboard";
import { formatRupiah } from "../data/cars";

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRecord | null;
  whatsappNumber: string;
  onOpenTracker: (bookingId?: string) => void;
}

export default function BookingSuccessModal({
  isOpen,
  onClose,
  booking,
  whatsappNumber,
  onOpenTracker,
}: BookingSuccessModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [uploadedProof, setUploadedProof] = useState<string>(booking?.paymentProofUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7190);

  useEffect(() => {
    if (booking?.paymentProofUrl) {
      setUploadedProof(booking.paymentProofUrl);
    }
  }, [booking?.paymentProofUrl]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleCopyAccount = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const formatCurrency = (amount: number) => formatRupiah(amount);

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const waMessage = encodeURIComponent(
    `Halo Admin Royal Drive, saya telah melakukan pemesanan via website:
` +
    `• No. Booking: ${booking.id}
` +
    `• Nama Penyewa: ${booking.client}
` +
    `• Unit Mobil: ${booking.car}
` +
    `• Tanggal: ${booking.startDate} s/d ${booking.endDate} (${booking.durationDays} Hari)
` +
    `• Layanan: ${booking.rentalType}
` +
    `• Total Biaya: ${formatCurrency(booking.totalPrice)}
` +
    `• Tagihan DP: ${formatCurrency(booking.depositAmount)}
` +
    `• Lokasi Jemput: ${booking.pickupLocation || "Showroom"}

` +
    `Mohon konfirmasi pesanan saya. Terima kasih!`
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white font-sans">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-left my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 relative border-b border-slate-700">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer focus:outline-none print:hidden"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center backdrop-blur-md shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                Pemesanan Berhasil Terdaftar
              </span>
              <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
                Bukti Konfirmasi Reservasi
              </h2>
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm font-light max-w-lg leading-relaxed">
            Terima kasih, <strong>{booking.client}</strong>! Reservasi armada Anda telah masuk ke sistem operasional kami. Jadwal unit Anda ditahan sementara untuk proses pembayaran DP.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-5">

          {/* Booking Code Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Nomor Registrasi Booking Resmi
              </span>
              <span className="font-mono font-black text-2xl sm:text-3xl text-accent tracking-wider block">
                {booking.id}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Simpan nomor ini untuk melacak unit atau konfirmasi ke tim operasional.
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedCode ? "Tersalin!" : "Salin Kode"}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer print:hidden"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Cetak</span>
              </button>
            </div>
          </div>

          {/* Booking Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* Unit & Type */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center space-x-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <Car className="w-3.5 h-3.5 text-accent" />
                <span>Armada Pilihan</span>
              </div>
              <div>
                <span className="font-display font-bold text-sm sm:text-base text-slate-900 block">
                  {booking.car}
                </span>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {booking.rentalType}
                </span>
              </div>
            </div>

            {/* Dates */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center space-x-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span>Jadwal Sewa</span>
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  {booking.startDate} &mdash; {booking.endDate}
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Durasi Sewa: {booking.durationDays} Hari
                </span>
              </div>
            </div>

            {/* Pickup Location */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center space-x-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span>Lokasi Serah-Terima</span>
              </div>
              <p className="font-medium text-slate-800">
                {booking.pickupLocation || "Showroom Royal Drive (Gratis)"}
              </p>
            </div>

            {/* Financials */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center space-x-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <CreditCard className="w-3.5 h-3.5 text-accent" />
                <span>Rincian Biaya & DP</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Total Tarif Sewa:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(booking.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Tagihan DP (30%):</span>
                  <span>{formatCurrency(booking.depositAmount)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Payment Instructions Box with Countdown Timer */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Instruksi Transfer Pembayaran DP (30%)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-red-700 font-mono text-[11px] font-bold">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Batas Waktu: {formatCountdown(timeLeft)}</span>
              </div>
            </div>

            <p className="text-emerald-800 leading-relaxed text-[11px]">
              Silakan transfer uang muka (DP) sebesar <strong className="font-mono text-emerald-900 font-black">{formatCurrency(booking.depositAmount)}</strong> ke rekening resmi di bawah ini untuk konfirmasi otomatis:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
              
              {/* BCA */}
              <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[9px] font-bold block">BANK BCA</span>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount("8830192888", "bca")}
                    className="text-[9px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {copiedAccount === "bca" ? "Tersalin!" : "Salin"}
                  </button>
                </div>
                <span className="font-mono font-bold text-slate-900 block text-xs">8830-192-888</span>
                <span className="text-slate-500 text-[10px] block">a/n PT ROYAL DRIVE INDONESIA</span>
              </div>

              {/* Mandiri */}
              <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[9px] font-bold block">BANK MANDIRI</span>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount("1370088899221", "mandiri")}
                    className="text-[9px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {copiedAccount === "mandiri" ? "Tersalin!" : "Salin"}
                  </button>
                </div>
                <span className="font-mono font-bold text-slate-900 block text-xs">137-00-88899-221</span>
                <span className="text-slate-500 text-[10px] block">a/n PT ROYAL DRIVE INDONESIA</span>
              </div>

              {/* BRI */}
              <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[9px] font-bold block">BANK BRI</span>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount("034101002888301", "bri")}
                    className="text-[9px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {copiedAccount === "bri" ? "Tersalin!" : "Salin"}
                  </button>
                </div>
                <span className="font-mono font-bold text-slate-900 block text-xs">0341-01-002888-301</span>
                <span className="text-slate-500 text-[10px] block">a/n PT ROYAL DRIVE INDONESIA</span>
              </div>

            </div>
          </div>

          {/* Upload Bukti Transfer Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Upload Bukti Transfer DP (Struk / Tangkapan Layar m-Banking)</span>
              </span>
              {uploadedProof && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  ✓ Bukti Terunggah
                </span>
              )}
            </div>

            {uploadedProof ? (
              <div className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                  <img src={uploadedProof} alt="Bukti Transfer" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-[11px]">
                  <span className="font-semibold text-slate-800 block">Struk Bukti Transfer Berhasil Disimpan</span>
                  <span className="text-slate-500 text-[10px] block mt-0.5">
                    Tim kasir kami sedang memvalidasi mutasi bank untuk pesanan {booking.id}.
                  </span>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white p-4 rounded-xl text-center cursor-pointer transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setIsUploading(true);
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (ev) => {
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
                          ctx?.drawImage(img, 0, 0, width, height);
                          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
                          setUploadedProof(dataUrl);
                          setIsUploading(false);

                          const timeStr = `${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}, ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
                          try {
                            fetch("/api/bookings", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                ...booking,
                                paymentProofUrl: dataUrl,
                                paymentProofTime: timeStr,
                              }),
                            }).catch(() => {});
                          } catch {}

                          try {
                            const saved = localStorage.getItem("royal_drive_bookings_v2");
                            if (saved) {
                              const list: BookingRecord[] = JSON.parse(saved);
                              const updated = list.map((b) => 
                                b.id === booking.id 
                                  ? { ...b, paymentProofUrl: dataUrl, paymentProofTime: timeStr } 
                                  : b
                              );
                              localStorage.setItem("royal_drive_bookings_v2", JSON.stringify(updated));
                            }
                          } catch {}
                        };
                        img.src = ev.target?.result as string;
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-1 text-slate-500">
                  <Upload className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs text-slate-700 font-medium">
                    {isUploading ? "Mengunggah & Mengompresi Struk..." : "Pilih File / Foto Bukti Transfer DP"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Mendukung format JPG, PNG, atau tangkapan layar m-Banking
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-center cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Konfirmasi via WhatsApp Admin</span>
            </a>

            <button
              onClick={() => {
                onClose();
                onOpenTracker(booking.id);
              }}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-slate-900/10"
            >
              <span>Lacak Status Armada</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
