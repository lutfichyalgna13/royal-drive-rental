"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeftRight, X, Sparkles, Check, Users, Fuel, 
  Briefcase, ShieldCheck, UserCheck, Star, SlidersHorizontal, 
  Eye, Zap, AlertCircle, ShoppingBag, MessageSquare
} from "lucide-react";
import { Car, formatRupiah } from "../data/cars";

interface CarComparisonProps {
  compareList: Car[];
  onRemove: (car: Car) => void;
  onClear: () => void;
  onSelectCar?: (car: Car) => void;
  onBookCar?: (car: Car) => void;
  whatsappNumber?: string;
}

export default function CarComparison({ 
  compareList, 
  onRemove, 
  onClear,
  onSelectCar,
  onBookCar,
  whatsappNumber = "6281234567890"
}: CarComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  const formatCurrency = (val: number) => formatRupiah(val);

  if (compareList.length === 0) return null;

  // Calculate smart winner badges
  const minPrice = Math.min(...compareList.map((c) => c.pricePerDay));
  const maxSeats = Math.max(...compareList.map((c) => c.seats));
  const maxRating = Math.max(...compareList.map((c) => c.rating));
  const maxBaggage = Math.max(...compareList.map((c) => c.baggage));

  // Specifications definition
  const specRows = [
    {
      id: "price",
      label: "Harga Sewa Unit",
      icon: <Zap className="w-3.5 h-3.5 text-red-600" />,
      getValue: (car: Car) => car.pricePerDay,
      render: (car: Car) => (
        <div className="space-y-1">
          <span className="font-display font-black text-xs sm:text-base text-red-600 block" suppressHydrationWarning>
            {formatCurrency(car.pricePerDay)}
          </span>
          <span className="text-[9px] text-slate-400 font-sans block">/ Hari</span>
          {car.pricePerDay === minPrice && compareList.length > 1 && (
            <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full">
              <span>★ Paling Hemat</span>
            </span>
          )}
        </div>
      ),
    },
    {
      id: "transmission",
      label: "Transmisi",
      icon: <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />,
      getValue: (car: Car) => car.transmission,
      render: (car: Car) => (
        <span className="font-semibold text-xs sm:text-sm text-slate-800">
          {car.transmission}
        </span>
      ),
    },
    {
      id: "seats",
      label: "Kapasitas Penumpang",
      icon: <Users className="w-3.5 h-3.5 text-sky-600" />,
      getValue: (car: Car) => car.seats,
      render: (car: Car) => (
        <div className="space-y-0.5">
          <span className="text-xs sm:text-sm text-slate-800 font-bold block">
            {car.seats} Kursi
          </span>
          {car.seats === maxSeats && compareList.length > 1 && (
            <span className="inline-flex items-center bg-sky-50 text-sky-700 border border-sky-200 text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full">
              Muat Terbanyak
            </span>
          )}
        </div>
      ),
    },
    {
      id: "baggage",
      label: "Kapasitas Bagasi",
      icon: <Briefcase className="w-3.5 h-3.5 text-purple-600" />,
      getValue: (car: Car) => car.baggage,
      render: (car: Car) => (
        <div className="space-y-0.5">
          <span className="text-xs sm:text-sm text-slate-800 font-medium block">
            {car.baggage} Koper Besar
          </span>
          {car.baggage === maxBaggage && compareList.length > 1 && (
            <span className="inline-flex items-center bg-purple-50 text-purple-700 border border-purple-200 text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full">
              Bagasi Luas
            </span>
          )}
        </div>
      ),
    },
    {
      id: "fuel",
      label: "Bahan Bakar",
      icon: <Fuel className="w-3.5 h-3.5 text-rose-600" />,
      getValue: (car: Car) => car.fuelType,
      render: (car: Car) => (
        <span className="text-xs sm:text-sm text-slate-700 font-semibold">
          {car.fuelType}
        </span>
      ),
    },
    {
      id: "rating",
      label: "Rating Kepuasan",
      icon: <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />,
      getValue: (car: Car) => car.rating,
      render: (car: Car) => (
        <div className="space-y-0.5">
          <div className="flex items-center justify-center space-x-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            <span className="font-display font-bold text-xs sm:text-sm text-slate-900">{car.rating}</span>
          </div>
          <span className="text-[9px] text-slate-400 font-sans block">({car.reviewsCount} ulasan)</span>
        </div>
      ),
    },
    {
      id: "driver",
      label: "Layanan Sopir (Opsional)",
      icon: <UserCheck className="w-3.5 h-3.5 text-emerald-600" />,
      getValue: (car: Car) => car.driverPricePerDay,
      render: (car: Car) => (
        <div className="text-xs">
          <span className="text-emerald-700 font-bold block" suppressHydrationWarning>
            +{formatCurrency(car.driverPricePerDay)}
          </span>
          <span className="text-[9px] text-slate-400">/ Hari</span>
        </div>
      ),
    },
    {
      id: "fuelPrice",
      label: "Estimasi BBM",
      icon: <Fuel className="w-3.5 h-3.5 text-amber-600" />,
      getValue: (car: Car) => car.fuelPricePerDay,
      render: (car: Car) => (
        <div className="text-xs">
          <span className="text-slate-700 font-semibold block" suppressHydrationWarning>
            +{formatCurrency(car.fuelPricePerDay)}
          </span>
          <span className="text-[9px] text-slate-400">/ Hari</span>
        </div>
      ),
    },
    {
      id: "insurance",
      label: "Asuransi All-Risk",
      icon: <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />,
      getValue: (car: Car) => car.insurancePricePerDay,
      render: (car: Car) => (
        <div className="flex items-center justify-center space-x-1 text-xs text-teal-700 font-semibold">
          <Check className="w-3 h-3 text-teal-600 shrink-0" />
          <span suppressHydrationWarning>+{formatCurrency(car.insurancePricePerDay)}/hr</span>
        </div>
      ),
    },
    {
      id: "total",
      label: "Total Paket Lengkap (Mobil + Sopir + BBM + Asuransi)",
      icon: <ShoppingBag className="w-3.5 h-3.5 text-red-600" />,
      getValue: (car: Car) => car.pricePerDay + car.driverPricePerDay + car.fuelPricePerDay + car.insurancePricePerDay,
      render: (car: Car) => {
        const total = car.pricePerDay + car.driverPricePerDay + car.fuelPricePerDay + car.insurancePricePerDay;
        return (
          <div className="space-y-0.5">
            <span className="font-display font-black text-xs sm:text-base text-slate-900 block" suppressHydrationWarning>
              {formatCurrency(total)}
            </span>
            <span className="text-[9px] text-slate-400">/ Hari</span>
          </div>
        );
      },
    },
    {
      id: "available",
      label: "Ketersediaan Unit",
      icon: <AlertCircle className="w-3.5 h-3.5 text-slate-500" />,
      getValue: (car: Car) => car.available,
      render: (car: Car) => (
        <span className={`inline-flex items-center space-x-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${
          car.available 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
            : "bg-rose-50 text-rose-700 border border-rose-200"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${car.available ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
          <span>{car.available ? "Tersedia" : "Tersewa"}</span>
        </span>
      ),
    },
  ];

  // Filter rows if "only differences" is checked
  const displayedRows = onlyDifferences && compareList.length > 1
    ? specRows.filter((row) => {
        const firstVal = row.getValue(compareList[0]);
        return compareList.some((c) => row.getValue(c) !== firstVal);
      })
    : specRows;

  // Layout grid column class based on number of cars (fits 100% without horizontal scroll)
  const gridColsClass = compareList.length === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <>
      {/* FLOATING BOTTOM COMPARISON DOCK */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-3 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-[96%] max-w-2xl bg-white/95 backdrop-blur-xl border border-slate-200 p-2 sm:p-3.5 rounded-2xl flex items-center justify-between shadow-2xl shadow-slate-900/15 gap-1.5 sm:gap-4"
        suppressHydrationWarning
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="bg-red-50 p-2 rounded-xl border border-red-100 text-red-600 shrink-0">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-bold text-xs sm:text-sm text-slate-900 truncate">
                Bandingkan ({compareList.length}/3)
              </span>
            </div>
            <span className="text-[10px] text-slate-500 truncate block sm:inline">
              {compareList.length < 2 ? "Pilih 1 unit lagi" : "Siap dibandingkan"}
            </span>
          </div>
        </div>

        {/* Selected Car Thumbnails */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {compareList.map((car) => (
            <div
              key={car.id}
              className="relative group w-10 h-8 sm:w-14 sm:h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-sm"
            >
              <img src={car.image} className="w-full h-full object-cover" alt={car.name} />
              <button
                onClick={() => onRemove(car)}
                className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-slate-800/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] transition-colors focus:outline-none cursor-pointer"
                title="Hapus"
              >
                <X className="w-2 h-2" />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 3 - compareList.length) }).map((_, idx) => (
            <div
              key={idx}
              className="w-8 h-8 sm:w-12 sm:h-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-semibold"
            >
              +
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={onClear}
            className="font-display text-[10px] uppercase tracking-wider text-slate-500 hover:text-slate-800 px-2 py-2 transition-colors cursor-pointer focus:outline-none font-semibold"
          >
            Reset
          </button>
          <button
            onClick={() => setIsOpen(true)}
            disabled={compareList.length < 2}
            className={`flex items-center justify-center space-x-1.5 font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider px-3.5 sm:px-5 py-2.5 rounded-xl transition-all focus:outline-none ${
              compareList.length >= 2
                ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-lg shadow-red-600/25 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buka Perbandingan</span>
            <span className="sm:hidden">Lihat ({compareList.length})</span>
          </button>
        </div>
      </motion.div>

      {/* FULLSCREEN COMPARISON OVERLAY MODAL (FIT TO SCREEN - NO HORIZONTAL SCROLL) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6" suppressHydrationWarning>
            <motion.div
              initial={{ y: 25, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 25, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 260 }}
              className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Top Header Bar */}
              <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2 bg-white sticky top-0 z-30">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-black text-sm sm:text-lg text-slate-900 tracking-tight truncate">
                      Perbandingan Armada
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-sans truncate">
                      {compareList.length} unit mobil siap dibandingkan
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {/* Toggle "Hanya Perbedaan" */}
                  <label className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-semibold text-slate-700 cursor-pointer select-none bg-slate-100 border border-slate-200/80 px-2.5 py-1.5 rounded-xl hover:bg-slate-200/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={onlyDifferences}
                      onChange={(e) => setOnlyDifferences(e.target.checked)}
                      className="rounded accent-red-600 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className="hidden sm:inline">Hanya Perbedaan</span>
                    <span className="sm:hidden">Beda Saja</span>
                  </label>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer focus:outline-none"
                    title="Tutup"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* STICKY TOP STRIP: CAR CARDS (FIT 100% WIDTH - ZERO HORIZONTAL SCROLL) */}
              <div className={`grid ${gridColsClass} gap-2 sm:gap-4 p-3 sm:p-4 bg-slate-50/90 border-b border-slate-200 sticky top-[53px] sm:top-[65px] z-20 backdrop-blur-md`}>
                {compareList.map((car) => (
                  <div 
                    key={car.id} 
                    className="bg-white border border-slate-200/90 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col justify-between shadow-sm relative group"
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => {
                        onRemove(car);
                        if (compareList.length <= 2) {
                          setIsOpen(false);
                        }
                      }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-400 rounded-full flex items-center justify-center text-[10px] transition-colors focus:outline-none cursor-pointer z-10"
                      title="Hapus unit"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* Image */}
                    <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 mb-1.5 sm:mb-2 border border-slate-100">
                      <img src={car.image} className="w-full h-full object-cover" alt={car.name} />
                    </div>

                    {/* Info */}
                    <div className="text-center min-w-0 mb-2">
                      <h4 className="font-display font-bold text-[11px] sm:text-sm text-slate-900 truncate">
                        {car.name}
                      </h4>
                      <span className="text-[9px] font-semibold text-red-600 uppercase tracking-wider block">
                        {car.category}
                      </span>
                    </div>

                    {/* CTA Actions */}
                    <div className="flex flex-col sm:flex-row gap-1">
                      {onSelectCar && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onSelectCar(car);
                          }}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-display text-[9px] sm:text-[10px] font-bold uppercase py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors cursor-pointer focus:outline-none"
                        >
                          <Eye className="w-3 h-3" />
                          <span className="hidden sm:inline">Detail</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          if (onBookCar) {
                            onBookCar(car);
                          } else {
                            const text = encodeURIComponent(`Halo Royal Drive, saya tertarik menyewa mobil ${car.name} setelah membandingkannya di website.`);
                            window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
                          }
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-display text-[9px] sm:text-[10px] font-bold uppercase py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-colors cursor-pointer shadow-sm focus:outline-none"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Pilih</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* VERTICAL COMPARISON LIST (NO HORIZONTAL SCROLL - CLEAN & READABLE) */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5 sm:space-y-3">
                {displayedRows.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <span className="font-bold text-sm text-slate-800 block">Semua spesifikasi armada yang dipilih sama persis!</span>
                    <span className="text-xs text-slate-500">Hilangkan centang &ldquo;Hanya Perbedaan&rdquo; untuk melihat rincian lengkap.</span>
                  </div>
                ) : (
                  displayedRows.map((row) => (
                    <div 
                      key={row.id} 
                      className="bg-slate-50/80 border border-slate-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 space-y-2 hover:border-slate-300 transition-colors"
                    >
                      {/* Spec Label Header */}
                      <div className="flex items-center space-x-2 text-slate-700 font-display font-bold text-[11px] sm:text-xs border-b border-slate-200/60 pb-1.5">
                        <div className="p-1 rounded-md bg-white border border-slate-200/60 shrink-0">
                          {row.icon}
                        </div>
                        <span className="truncate">{row.label}</span>
                      </div>

                      {/* Values Grid Side-by-Side (Fit to screen) */}
                      <div className={`grid ${gridColsClass} gap-2 sm:gap-4`}>
                        {compareList.map((car) => (
                          <div 
                            key={car.id} 
                            className="bg-white border border-slate-200/80 rounded-xl p-2 sm:p-3 text-center flex flex-col items-center justify-center min-h-[50px] shadow-2xs"
                          >
                            {row.render(car)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Bottom Bar */}
              <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
                <span className="flex items-center space-x-1 font-medium truncate">
                  <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span className="truncate">Lencana hijau/biru menandakan unit paling unggul.</span>
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-display text-[10px] uppercase tracking-wider font-bold transition-colors focus:outline-none cursor-pointer shadow-2xs shrink-0"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
