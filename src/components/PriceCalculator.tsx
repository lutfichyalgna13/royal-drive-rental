"use client";

import { useState, useEffect } from "react";
import { Sliders, Calculator, Info } from "lucide-react";
import { Car, PricingSeason, calculateSeasonalAdjustment, defaultPricingSeasons, formatRupiah } from "../data/cars";

interface PriceCalculatorProps {
  cars: Car[];
  onBook: (bookingDetails: {
    carId: string;
    carName: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    withDriver: boolean;
  }) => void;
}

export default function PriceCalculator({ cars, onBook }: PriceCalculatorProps) {
  const [selectedCarId, setSelectedCarId] = useState(cars[0]?.id || "");
  const [duration, setDuration] = useState(3); // days
  const [extraHours, setExtraHours] = useState(0); // hours
  const [driver, setDriver] = useState(true);
  const [bbm, setBbm] = useState(false);
  const [asuransi, setAsuransi] = useState(true);
  const [childSeat, setChildSeat] = useState(false);
  const [airportPickup, setAirportPickup] = useState(false);
  const [seasons, setSeasons] = useState<PricingSeason[]>(defaultPricingSeasons);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const selectedCar = cars.find((c) => c.id === selectedCarId) || cars[0];

  const start = new Date();
  start.setDate(start.getDate() + 1); // tomorrow
  const end = new Date();
  end.setDate(end.getDate() + 1 + duration);
  const startStr = mounted ? start.toISOString().split("T")[0] : "2026-09-13";
  const endStr = mounted ? end.toISOString().split("T")[0] : "2026-09-16";

  const seasonalResult = selectedCar ? calculateSeasonalAdjustment(startStr, endStr, selectedCar.pricePerDay, seasons) : { totalSurcharge: 0, breakdown: [], hasSurcharge: false };

  const baseCost = selectedCar ? selectedCar.pricePerDay * duration : 0;
  const driverCost = selectedCar && driver ? selectedCar.driverPricePerDay * duration : 0;
  const bbmCost = selectedCar && bbm ? selectedCar.fuelPricePerDay * duration : 0;
  const asuransiCost = selectedCar && asuransi ? selectedCar.insurancePricePerDay * duration : 0;
  
  let addonsCost = 0;
  if (childSeat) addonsCost += 150000 * duration;
  if (airportPickup) addonsCost += 350000;

  const hourlyRate = selectedCar ? (selectedCar.pricePerDay / 24) * 1.5 : 0;
  const extraHoursCost = Math.round(hourlyRate * extraHours);
  const totalCost = baseCost + driverCost + bbmCost + asuransiCost + addonsCost + extraHoursCost + seasonalResult.totalSurcharge;

  const handleConfirmBooking = () => {
    if (!selectedCar) return;

    onBook({
      carId: selectedCar.id,
      carName: selectedCar.name,
      startDate: startStr,
      endDate: endStr,
      totalPrice: totalCost,
      withDriver: driver,
    });
  };

  const formatCurrency = (val: number) => formatRupiah(val);

  return (
    <section id="calculator" className="py-16 sm:py-24 bg-white relative border-t border-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.01),transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="font-display text-xs uppercase tracking-[0.25em] text-accent font-semibold">
            Estimator Transparan
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-5xl text-slate-800 mt-3 tracking-tight">
            Kalkulator Harga Interaktif
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-6 rounded-full" />
          <p className="font-sans font-light text-slate-500 text-xs sm:text-sm mt-4 tracking-wide px-2 sm:px-0">
            Sesuaikan durasi sewa, kebutuhan supir, jaminan asuransi, dan aksesoris tambahan untuk melihat rincian biaya real-time.
          </p>
        </div>

        {/* Console Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-stretch">
          
          {/* LEFT: Controls (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200/60 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl flex flex-col justify-between space-y-6" suppressHydrationWarning>
            <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-widest flex items-center space-x-2 border-b border-slate-200/60 pb-4">
              <Sliders className="w-4 h-4 text-accent" />
              <span>Konfigurasi Rental</span>
            </h3>

            {/* Select Car */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold block">
                Pilih Kendaraan
              </label>
              <select
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
                className="w-full glass-input px-4 py-3.5 rounded-xl font-display text-sm focus:outline-none"
                suppressHydrationWarning
              >
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name} ({formatCurrency(car.pricePerDay)} / Hari)
                  </option>
                ))}
              </select>
            </div>

            {/* Durasi Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                <span>Durasi Sewa</span>
                <span className="text-accent font-display text-sm font-bold">{duration} Hari</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex items-center justify-between text-[8px] text-slate-400">
                <span>1 Hari</span>
                <span>15 Hari</span>
                <span>30 Hari</span>
              </div>
            </div>

            {/* Extra Hours Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                <span>Kelebihan Jam (Overtime)</span>
                <span className="text-accent font-display text-sm font-bold">{extraHours} Jam</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                value={extraHours}
                onChange={(e) => setExtraHours(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex items-center justify-between text-[8px] text-slate-400">
                <span>0 Jam</span>
                <span>6 Jam</span>
                <span>12 Jam</span>
              </div>
            </div>

            {/* Toggles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              
              {/* Driver Switch */}
              <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl">
                <div>
                  <span className="font-display font-medium text-xs text-slate-800 block">Sopir Profesional</span>
                  <span className="text-[9px] text-slate-500">Termasuk makan & istirahat</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={driver}
                    onChange={(e) => setDriver(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent" />
                </label>
              </div>

              {/* BBM Switch */}
              <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl">
                <div>
                  <span className="font-display font-medium text-xs text-slate-800 block">Bahan Bakar (BBM)</span>
                  <span className="text-[9px] text-slate-500">Pengisian ditanggung rental</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bbm}
                    onChange={(e) => setBbm(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent" />
                </label>
              </div>

              {/* Asuransi Switch */}
              <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl">
                <div>
                  <span className="font-display font-medium text-xs text-slate-800 block">Proteksi All-Risk</span>
                  <span className="text-[9px] text-slate-500">Asuransi kerusakan penuh</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={asuransi}
                    onChange={(e) => setAsuransi(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent" />
                </label>
              </div>

              {/* Child Seat Switch */}
              <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl">
                <div>
                  <span className="font-display font-medium text-xs text-slate-800 block">Kursi Bayi (Child Seat)</span>
                  <span className="text-[9px] text-slate-500">Keamanan ekstra balita</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={childSeat}
                    onChange={(e) => setChildSeat(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent" />
                </label>
              </div>

              {/* Airport Pickup Switch */}
              <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl sm:col-span-2">
                <div>
                  <span className="font-display font-medium text-xs text-slate-800 block">Penjemputan Bandara (Airport Pickup)</span>
                  <span className="text-[9px] text-slate-500">Layanan meet & greet VIP di terminal kedatangan</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={airportPickup}
                    onChange={(e) => setAirportPickup(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent" />
                </label>
              </div>

            </div>

          </div>

          {/* RIGHT: Invoice Summary (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-sm">
            <div className="space-y-6" suppressHydrationWarning>
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-widest flex items-center space-x-2 border-b border-slate-200/60 pb-4">
                <Calculator className="w-4 h-4 text-accent" />
                <span>Rincian Estimasi Biaya</span>
              </h3>

              {/* Selected Car Display Card */}
              <div className="flex items-center space-x-4 bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="w-20 aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={selectedCar.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-accent font-semibold">
                    {selectedCar.category}
                  </span>
                  <span className="font-display font-bold text-xs text-slate-800 block">
                    {selectedCar.name}
                  </span>
                </div>
              </div>

              {/* Itemized list */}
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Sewa Dasar ({duration} hari)</span>
                  <span className="text-slate-800 font-medium">{formatCurrency(baseCost)}</span>
                </div>

                {driver && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Sopir Profesional ({duration} hari)</span>
                    <span className="text-slate-800 font-medium">{formatCurrency(driverCost)}</span>
                  </div>
                )}

                {bbm && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Bahan Bakar ({duration} hari)</span>
                    <span className="text-slate-800 font-medium">{formatCurrency(bbmCost)}</span>
                  </div>
                )}

                {asuransi && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Proteksi All-Risk ({duration} hari)</span>
                    <span className="text-slate-800 font-medium">{formatCurrency(asuransiCost)}</span>
                  </div>
                )}

                {extraHours > 0 && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Kelebihan Jam ({extraHours} jam)</span>
                    <span className="text-slate-800 font-medium">{formatCurrency(extraHoursCost)}</span>
                  </div>
                )}

                {addonsCost > 0 && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Aksesoris & Layanan Ekstra</span>
                    <span className="text-slate-800 font-medium">{formatCurrency(addonsCost)}</span>
                  </div>
                )}

                {seasonalResult.hasSurcharge && (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>⚡ Tarif Weekend / Peak Season</span>
                      <span className="font-mono">+{formatCurrency(seasonalResult.totalSurcharge)}</span>
                    </div>
                    <div className="text-[10px] text-amber-700 space-y-0.5">
                      {seasonalResult.breakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.name} ({item.daysCount} hr @ +{item.percent}%):</span>
                          <span>+{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total Block */}
            <div className="border-t border-slate-200 pt-6 mt-6">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 block mb-0.5">
                    Total Pembayaran
                  </span>
                  <span className="font-display font-black text-2xl md:text-3xl text-accent">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                className="w-full flex items-center justify-center space-x-2 bg-accent hover:bg-accent-hover text-white font-display font-bold text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-accent/15 cursor-pointer focus:outline-none"
              >
                <span>Konfirmasi Booking</span>
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[9px] text-slate-500 mt-4 text-center">
                <Info className="w-3 h-3 text-accent" />
                <span>Pembatalan gratis hingga 24 jam sebelum pengambilan.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
