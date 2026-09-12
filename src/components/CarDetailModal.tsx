"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sliders, MoveRight, MessageCircle } from "lucide-react";
import { Car, PricingSeason, calculateSeasonalAdjustment, defaultPricingSeasons, formatRupiah } from "../data/cars";

interface CarDetailModalProps {
  car: Car | null;
  onClose: () => void;
  onBook: (bookingDetails: {
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
  }) => void;
  whatsappNumber: string;
}

export default function CarDetailModal({ car, onClose, onBook, whatsappNumber }: CarDetailModalProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [seasons, setSeasons] = useState<PricingSeason[]>(defaultPricingSeasons);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("royal_drive_pricing_seasons_v1");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setSeasons(parsed);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);
  
  // Booking state inside modal
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [withDriver, setWithDriver] = useState(false);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  
  const seasonalResult = car ? calculateSeasonalAdjustment(startDate, endDate, car.pricePerDay, seasons) : { totalSurcharge: 0, breakdown: [], hasSurcharge: false };
  const basePrice = car ? car.pricePerDay * diff : 0;
  const driverPrice = car && withDriver ? car.driverPricePerDay * diff : 0;
  const calculatedPrice = basePrice + driverPrice + seasonalResult.totalSurcharge;

  if (!car) return null;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook({
      carId: car.id,
      carName: car.name,
      startDate,
      endDate,
      totalPrice: calculatedPrice,
      withDriver,
      carImage: car.image,
      pricePerDay: car.pricePerDay,
      category: car.category,
      transmission: car.transmission,
      seats: car.seats,
    });
  };

  const formatCurrency = (val: number) => formatRupiah(val);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-primary-dark/95 backdrop-blur-md flex items-center justify-center p-0 md:p-6 lg:p-12"
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="w-full max-w-7xl bg-primary border border-slate-200 rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row h-full max-h-[100vh] lg:max-h-[90vh]"
        >
          {/* LEFT PANEL: Media Viewer (Foto Gallery) */}
          <div className="w-full lg:w-7/12 bg-slate-50 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-200 relative min-h-[40vh] lg:min-h-0">
            {/* Main Media Showcase */}
            <div className="flex-1 flex flex-col justify-center p-6 relative">
              <div className="w-full h-full flex flex-col justify-center">
                <div className="aspect-video w-full max-h-[300px] lg:max-h-[400px] rounded-2xl overflow-hidden relative border border-slate-200 shadow-sm">
                  <img
                    src={car.gallery[activeImage] || car.image}
                    alt={car.name}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                </div>
                {/* Thumbnails */}
                <div className="flex items-center justify-center space-x-3 mt-6">
                  {car.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-16 aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer focus:outline-none ${
                        activeImage === idx ? "border-accent scale-105" : "border-transparent opacity-60"
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Details & Booking Form */}
          <div className="w-full lg:w-5/12 flex flex-col justify-between overflow-y-auto max-h-full lg:max-h-none">
            {/* Close Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent font-medium">
                  {car.category}
                </span>
                <h3 className="font-display font-extrabold text-2xl text-slate-800">
                  {car.name}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Spec Cards & Form */}
            <div className="p-6 md:p-8 space-y-8 flex-1">
              
              {/* Detailed Specs Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 block mb-1">
                    Transmisi
                  </span>
                  <div className="flex items-center space-x-2 text-slate-800">
                    <span className="font-display font-semibold text-xs">{car.transmission}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 block mb-1">
                    Bahan Bakar
                  </span>
                  <div className="flex items-center space-x-2 text-slate-800">
                    <span className="font-display font-semibold text-xs">{car.fuelType}</span>
                  </div>
                </div>
              </div>

              {/* Kalender Ketersediaan (Mockup) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-display uppercase tracking-widest text-slate-500">
                    Kalender Ketersediaan
                  </span>
                  <span className="text-accent flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span>Tersedia Minggu Ini</span>
                  </span>
                </div>
                {/* 7-day grid placeholder */}
                <div className="grid grid-cols-7 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="text-[8px] text-slate-500 uppercase tracking-wider block">{day}</span>
                      <div className={`text-xs font-semibold py-1.5 rounded-md ${
                        idx === 3 || idx === 4
                          ? "bg-slate-200 text-slate-400 line-through" // Booked dates
                          : "bg-emerald-50 text-emerald-600 border border-emerald-200" // Available
                      }`}>
                        {idx + 3}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Form Card */}
              <form onSubmit={handleBookingSubmit} className="space-y-5 bg-slate-50 border border-slate-200 p-6 rounded-2xl">
                <h4 className="font-display font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-accent" />
                  <span>Atur Reservasi</span>
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-slate-400">
                      Mulai Tanggal
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full glass-input px-3 py-2 rounded-lg font-sans text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-slate-400">
                      Selesai Tanggal
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      className="w-full glass-input px-3 py-2 rounded-lg font-sans text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Driver Toggle Switch */}
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-display text-xs text-slate-800 block">
                      Gunakan Supir Profesional
                    </span>
                    <span className="text-[9px] text-slate-500">
                      Tambahan {formatCurrency(car.driverPricePerDay)} / Hari
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={withDriver}
                      onChange={(e) => setWithDriver(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600" />
                  </label>
                </div>

                {/* Seasonal / Weekend Surcharge Breakdown Box */}
                {seasonalResult.hasSurcharge && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 text-xs text-amber-950">
                    <div className="flex items-center justify-between font-bold text-[11px] text-amber-900">
                      <span className="flex items-center space-x-1">
                        <span>⚡ Penyesuaian Tarif Musim Libur / Akhir Pekan:</span>
                      </span>
                      <span>+{formatCurrency(seasonalResult.totalSurcharge)}</span>
                    </div>
                    <div className="text-[10px] text-amber-800 space-y-0.5 pt-1 border-t border-amber-200/60">
                      {seasonalResult.breakdown.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span>&bull; {item.name} ({item.daysCount} hari @ +{item.percent}%):</span>
                          <span className="font-semibold font-mono">+{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Display */}
                <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-0.5">
                        Total Estimasi Biaya
                      </span>
                      {seasonalResult.hasSurcharge && (
                        <span className="text-[8px] uppercase tracking-wider font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded-md">
                          Peak Season
                        </span>
                      )}
                    </div>
                    <span className="font-display font-black text-2xl text-accent">
                      {formatCurrency(calculatedPrice)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {diff} Hari Sewa &bull; {withDriver ? "Dengan Supir" : "Lepas Kunci"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* WhatsApp Inquiry Button */}
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=Halo%20Admin%2C%20saya%20tertarik%20untuk%20bertanya%20sewa%20mobil%20${encodeURIComponent(car.name)}.%20Apakah%20unit%20tersedia%3F`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-display font-semibold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl transition-all cursor-pointer text-center focus:outline-none"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white stroke-none" />
                      <span>Tanya WA</span>
                    </a>

                    {/* Booking Form Submit Button */}
                    <button
                      type="submit"
                      className="flex items-center justify-center space-x-1.5 bg-accent hover:bg-accent-hover text-white font-display font-semibold text-[10px] uppercase tracking-widest px-4 py-3 rounded-xl transition-all cursor-pointer text-center focus:outline-none"
                    >
                      <span>Lanjut Booking</span>
                      <MoveRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
