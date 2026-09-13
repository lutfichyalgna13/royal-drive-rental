"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Users, Eye, ArrowLeftRight, Check, AlertCircle, SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react";
import { Car, formatRupiah } from "../data/cars";
import { SearchFilterState } from "./FloatSearch";

interface FleetSectionProps {
  cars: Car[];
  onCarSelect: (car: Car) => void;
  onCompareToggle: (car: Car) => void;
  compareList: Car[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories?: string[];
  searchFilters?: SearchFilterState | null;
  onResetFilters?: () => void;
}

export default function FleetSection({
  cars,
  onCarSelect,
  onCompareToggle,
  compareList,
  selectedCategory,
  setSelectedCategory,
  categories,
  searchFilters,
  onResetFilters,
}: FleetSectionProps) {
  const allCategoryTabs = [
    "All",
    ...(categories && categories.length > 0
      ? categories
      : Array.from(new Set(cars.map(c => c.category).filter(Boolean))))
  ];

  const hasActiveFilters = Boolean(
    searchFilters &&
      (searchFilters.category !== "Semua" ||
        searchFilters.brand !== "Semua" ||
        searchFilters.model !== "Semua" ||
        searchFilters.transmission !== "Semua" ||
        searchFilters.seats !== "Semua" ||
        !searchFilters.noBudgetLimit)
  );

  // cars is already filtered strictly by page.tsx (displayedCars)
  const filteredCars = cars;

  // Pagination / progressive display: start with 6 cars instead of immediately dumping 22 cars
  const [visibleCount, setVisibleCount] = useState(6);

  // Reset visibleCount whenever category tab or search filters change
  useEffect(() => {
    setVisibleCount(6);
  }, [selectedCategory, searchFilters]);

  const visibleCars = filteredCars.slice(0, visibleCount);

  const formatCurrency = (val: number) => formatRupiah(val);

  const isComparing = (carId: string) => {
    return compareList.some(c => c.id === carId);
  };


  return (
    <section id="fleet" className="py-24 bg-slate-50 relative">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-accent/2 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-blue-500/2 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-display text-xs uppercase tracking-[0.25em] text-accent font-semibold">
            Armada Eksklusif Kami
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-slate-800 mt-3 tracking-tight">
            Pilih Kendaraan Impian Anda
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-6 rounded-full" />
          <p className="font-sans font-light text-slate-500 text-sm mt-4 tracking-wide leading-relaxed">
            Setiap kendaraan dalam garasi kami dirawat secara berkala dengan standar pelayanan tertinggi demi menjamin keamanan dan kenyamanan perjalanan Anda.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-8">
          {allCategoryTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-display text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest transition-all duration-300 focus:outline-none cursor-pointer ${
                selectedCategory === cat
                  ? "bg-accent text-white font-semibold shadow-lg shadow-accent/15"
                  : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {cat === "All" ? "Semua Kategori" : cat}
            </button>
          ))}
        </div>

        {/* Active Search Filters Bar */}
        {hasActiveFilters && searchFilters && (
          <div className="mb-10 p-4 bg-white rounded-2xl border border-red-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-red-600" />
                Filter Aktif:
              </span>
              {searchFilters.category !== "Semua" && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  Kategori: <strong className="ml-1 text-slate-900">{searchFilters.category}</strong>
                </span>
              )}
              {searchFilters.brand !== "Semua" && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  Merek: <strong className="ml-1 text-slate-900">{searchFilters.brand}</strong>
                </span>
              )}
              {searchFilters.model !== "Semua" && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  Model: <strong className="ml-1 text-slate-900">{searchFilters.model}</strong>
                </span>
              )}
              {searchFilters.seats !== "Semua" && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  Kapasitas: <strong className="ml-1 text-slate-900">{searchFilters.seats === "10+" ? "10+ Penumpang" : `${searchFilters.seats} Penumpang`}</strong>
                </span>
              )}
              {searchFilters.transmission !== "Semua" && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  Transmisi: <strong className="ml-1 text-slate-900">{searchFilters.transmission}</strong>
                </span>
              )}
              {!searchFilters.noBudgetLimit && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                  Tarif: <strong className="ml-1 text-slate-900">≤ {formatCurrency(searchFilters.maxBudget)}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Ditemukan <strong className="text-red-600">{filteredCars.length}</strong> unit
              </span>
              {onResetFilters && (
                <button
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cars Swipeable List (Mobile) / Grid (Desktop) */}
        <div className="relative">
          {filteredCars.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800">
                Tidak Ada Armada yang Cocok
              </h3>
              <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
                Maaf, tidak ada unit kendaraan yang sesuai dengan kombinasi kriteria pencarian Anda. Silakan sesuaikan pilihan atau reset filter untuk melihat seluruh unit kami.
              </p>
              {onResetFilters && (
                <button
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Filter & Lihat Semua Armada
                </button>
              )}
            </div>
          ) : (
            <>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory + (searchFilters?.brand || "") + (searchFilters?.model || "")}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-6 md:pb-0 pt-2 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-auto md:w-full"
              >

              {visibleCars.map((car) => (
                <div
                  key={car.id}
                  className="group relative flex flex-col rounded-2xl glass-card overflow-hidden h-full w-[84vw] sm:w-[320px] md:w-auto shrink-0 md:shrink snap-center"
                >
                  {/* Image Container with scale zoom */}
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {/* Category & Rental Type Tags */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                      <span className="bg-white/95 border border-slate-200/50 shadow-sm px-3 py-1 rounded-full font-display text-[9px] uppercase tracking-widest text-accent font-semibold">
                        {car.category}
                      </span>
                      <span className="bg-red-50/95 border border-red-100 shadow-sm px-2.5 py-0.5 rounded-md font-display text-[8px] uppercase tracking-widest text-red-600 font-bold">
                        Lepas Kunci / Sopir
                      </span>
                    </div>

                    {/* Availability Badge */}
                    <span className={`absolute top-4 right-4 z-10 flex items-center space-x-1.5 px-3 py-1 rounded-full font-display text-[9px] uppercase tracking-widest backdrop-blur-md ${
                      car.available 
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-600 font-semibold"
                        : "bg-rose-50 border border-rose-200 text-rose-600 font-semibold"
                    }`}>
                      {car.available ? (
                        <>
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span>Tersedia</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>Tersewa</span>
                        </>
                      )}
                    </span>

                    {/* Beauty Shot */}
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Header: Name and rating */}
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-display font-bold text-lg text-slate-800 group-hover:text-accent transition-colors duration-300">
                          {car.name}
                        </h3>
                        <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                          <span className="font-display font-medium text-[10px] text-slate-700">
                            {car.rating}
                          </span>
                        </div>
                      </div>

                      {/* Specs Brief */}
                      <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-100 text-slate-500 text-xs mb-4">
                        <div className="flex flex-col items-center justify-center p-1.5 bg-slate-50 rounded-lg">
                          <Users className="w-3.5 h-3.5 text-accent/80 mb-1" />
                          <span className="text-[10px] text-slate-600">{car.seats} Kursi</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-1.5 bg-slate-50 rounded-lg">
                          <span className="font-display font-semibold text-accent/80 text-[10px] uppercase mb-1">
                            {car.transmission === "Dual-Clutch" ? "DCT" : car.transmission === "Automatic" ? "AT" : "MT"}
                          </span>
                          <span className="text-[10px] text-slate-600 tracking-wide">Transmisi</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-1.5 bg-slate-50 rounded-lg">
                          <span className="font-display font-semibold text-accent/80 text-[10px] uppercase mb-1">
                            {car.fuelType}
                          </span>
                          <span className="text-[10px] text-slate-600 tracking-wide">Bahan Bakar</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div>
                      <div className="flex items-end justify-between mb-6">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-slate-500 block mb-0.5">
                            Harga Mulai Dari
                          </span>
                          <span className="font-display font-extrabold text-lg text-accent" suppressHydrationWarning>
                            {formatCurrency(car.pricePerDay)}
                          </span>
                          <span className="text-[9px] text-slate-500"> / Hari</span>
                        </div>

                        {/* Compare Button */}
                        <button
                          onClick={() => onCompareToggle(car)}
                          className={`flex items-center space-x-1.5 border px-3 py-1.5 rounded-lg font-display text-[9px] uppercase tracking-widest transition-all focus:outline-none cursor-pointer ${
                            isComparing(car.id)
                              ? "bg-accent/10 border-accent text-accent"
                              : "border-slate-200 hover:border-accent/40 text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {isComparing(car.id) ? (
                            <>
                              <Check className="w-3 h-3 text-accent" />
                              <span>Bandingkan</span>
                            </>
                          ) : (
                            <>
                              <ArrowLeftRight className="w-3 h-3" />
                              <span>Bandingkan</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => onCarSelect(car)}
                        className="w-full shiny-hover flex items-center justify-center space-x-2 bg-slate-100 hover:bg-accent border border-slate-200 hover:border-accent text-slate-600 hover:text-white font-display font-semibold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 cursor-pointer focus:outline-none"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail Kendaraan</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Mobile Swipe Hint */}
          <div className="flex md:hidden items-center justify-center mt-3">
            <span className="bg-white/90 border border-slate-200/80 px-4 py-1.5 rounded-full font-medium text-[11px] text-slate-500 shadow-sm flex items-center space-x-2">
              <span className="animate-pulse">👈</span>
              <span>Geser ke samping untuk melihat unit lainnya</span>
              <span className="animate-pulse">👉</span>
            </span>
          </div>

          {/* Load More Button */}
          {filteredCars.length > visibleCount && (
            <div className="mt-10 md:mt-14 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-white hover:bg-slate-900 text-slate-800 hover:text-white font-display font-semibold text-xs uppercase tracking-wider border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <span>Tampilkan Lebih Banyak Armada</span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform text-accent" />
              </button>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </section>
  );
}

