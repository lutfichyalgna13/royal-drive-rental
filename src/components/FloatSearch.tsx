"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Car as CarIcon,
  Search,
  RotateCcw,
  Users,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Settings2,
} from "lucide-react";
import { Car, carsData, defaultCategories, extractCarBrand, extractCarModel, formatRupiah } from "../data/cars";

export interface SearchFilterState {
  category: string;
  brand: string;
  model: string;
  maxBudget: number;
  transmission: string;
  seats: string;
  noBudgetLimit: boolean;
}

interface FloatSearchProps {
  onSearch: (filters: SearchFilterState) => void;
  categories?: string[];
  cars?: Car[];
  activeFilters?: SearchFilterState | null;
  onReset?: () => void;
}

const MAX_BUDGET_CEILING = 5000000;
const MIN_BUDGET_FLOOR = 300000;

export default function FloatSearch({
  onSearch,
  categories,
  cars,
  activeFilters,
  onReset,
}: FloatSearchProps) {
  // Use passed cars or fallback to default dataset
  const fleet = useMemo(() => {
    return cars && cars.length > 0 ? cars : carsData;
  }, [cars]);

  // Active category list
  const activeCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    const catsFromFleet = Array.from(new Set(fleet.map((c) => c.category).filter(Boolean)));
    return catsFromFleet.length > 0 ? catsFromFleet : defaultCategories;
  }, [categories, fleet]);

  // Filter States
  const [category, setCategory] = useState<string>("Semua");
  const [brand, setBrand] = useState<string>("Semua");
  const [model, setModel] = useState<string>("Semua");
  const [transmission, setTransmission] = useState<string>("Semua");
  const [seats, setSeats] = useState<string>("Semua");
  const [maxBudget, setMaxBudget] = useState<number>(MAX_BUDGET_CEILING);
  const [noBudgetLimit, setNoBudgetLimit] = useState<boolean>(true);

  // Sync if parent updates activeFilters
  useEffect(() => {
    if (activeFilters) {
      setCategory(activeFilters.category || "Semua");
      setBrand(activeFilters.brand || "Semua");
      setModel(activeFilters.model || "Semua");
      setTransmission(activeFilters.transmission || "Semua");
      setSeats(activeFilters.seats || "Semua");
      setMaxBudget(activeFilters.maxBudget ?? MAX_BUDGET_CEILING);
      setNoBudgetLimit(activeFilters.noBudgetLimit ?? (activeFilters.maxBudget >= MAX_BUDGET_CEILING));
    }
  }, [activeFilters]);

  // 1. DYNAMIC BRANDS: Extracted strictly from cars belonging to the chosen category
  const availableBrands = useMemo(() => {
    const scopedCars = category === "Semua" ? fleet : fleet.filter((c) => c.category === category);
    const brandsSet = new Set<string>();
    scopedCars.forEach((c) => {
      const b = extractCarBrand(c.name);
      if (b && b !== "Lainnya") brandsSet.add(b);
    });
    return Array.from(brandsSet).sort();
  }, [category, fleet]);

  // 2. DYNAMIC MODELS: Extracted strictly from cars belonging to the chosen category and chosen brand
  const availableModels = useMemo(() => {
    let scopedCars = category === "Semua" ? fleet : fleet.filter((c) => c.category === category);
    if (brand !== "Semua") {
      scopedCars = scopedCars.filter((c) => extractCarBrand(c.name) === brand);
    }
    const modelsSet = new Set<string>();
    scopedCars.forEach((c) => {
      const m = extractCarModel(c.name, brand !== "Semua" ? brand : undefined);
      if (m && m !== "Lainnya") modelsSet.add(m);
    });
    return Array.from(modelsSet).sort();
  }, [category, brand, fleet]);

  // Handle Category Change (Cascading reset)
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    // If current brand is not available in new category, reset to Semua
    const scopedCars = newCat === "Semua" ? fleet : fleet.filter((c) => c.category === newCat);
    const validBrands = new Set(scopedCars.map((c) => extractCarBrand(c.name)));
    if (brand !== "Semua" && !validBrands.has(brand)) {
      setBrand("Semua");
      setModel("Semua");
    } else if (model !== "Semua") {
      // Also verify if current model is still valid
      const validModels = new Set(scopedCars.map((c) => extractCarModel(c.name)));
      if (!validModels.has(model)) {
        setModel("Semua");
      }
    }
  };

  // Handle Brand Change (Cascading reset)
  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    let scopedCars = category === "Semua" ? fleet : fleet.filter((c) => c.category === category);
    if (newBrand !== "Semua") {
      scopedCars = scopedCars.filter((c) => extractCarBrand(c.name) === newBrand);
    }
    const validModels = new Set(scopedCars.map((c) => extractCarModel(c.name, newBrand !== "Semua" ? newBrand : undefined)));
    if (model !== "Semua" && !validModels.has(model)) {
      setModel("Semua");
    }
  };

  // Handle Budget Slider Change
  const handleBudgetChange = (newVal: number) => {
    setMaxBudget(newVal);
    if (newVal >= MAX_BUDGET_CEILING) {
      setNoBudgetLimit(true);
    } else {
      setNoBudgetLimit(false);
    }
  };

  // Check if any filter is active
  const hasActiveFilters =
    category !== "Semua" ||
    brand !== "Semua" ||
    model !== "Semua" ||
    transmission !== "Semua" ||
    seats !== "Semua" ||
    !noBudgetLimit;

  // Live matching cars calculation
  const matchingCars = useMemo(() => {
    return fleet.filter((car) => {
      // 1. Category exact match
      if (category !== "Semua" && car.category !== category) return false;

      // 2. Brand match
      if (brand !== "Semua") {
        const carBrand = extractCarBrand(car.name);
        if (carBrand !== brand) return false;
      }

      // 3. Model match
      if (model !== "Semua") {
        const carModel = extractCarModel(car.name, brand !== "Semua" ? brand : undefined);
        if (carModel !== model && !car.name.toLowerCase().includes(model.toLowerCase())) {
          return false;
        }
      }

      // 4. Transmission match
      if (transmission !== "Semua" && car.transmission !== transmission) return false;

      // 5. Seats match
      if (seats === "4-5" && car.seats > 5) return false;
      if (seats === "6-8" && (car.seats < 6 || car.seats > 8)) return false;
      if (seats === "10+" && car.seats < 10) return false;

      // 6. Budget match
      if (!noBudgetLimit && car.pricePerDay > maxBudget) return false;

      return true;
    });
  }, [fleet, category, brand, model, transmission, seats, maxBudget, noBudgetLimit]);

  // Reset all filters
  const handleReset = () => {
    setCategory("Semua");
    setBrand("Semua");
    setModel("Semua");
    setTransmission("Semua");
    setSeats("Semua");
    setMaxBudget(MAX_BUDGET_CEILING);
    setNoBudgetLimit(true);
    if (onReset) onReset();
  };

  // Submit search
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      category,
      brand,
      model,
      maxBudget,
      transmission,
      seats,
      noBudgetLimit,
    });
  };

  return (
    <div
      id="booking-search"
      className="relative z-30 max-w-6xl mx-auto px-4 -mt-8 sm:-mt-20 md:-mt-28"
      suppressHydrationWarning
    >
      <div
        className="bg-white/95 backdrop-blur-md text-slate-800 p-5 sm:p-7 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 transition-all"
        suppressHydrationWarning
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-slate-800">
              Pencarian Cepat Armada
            </span>
            <span className="hidden sm:inline-block text-[11px] text-slate-400 font-sans">
              • Filter Presisi & Relevan
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-medium text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-slate-50"
                title="Reset semua filter pencarian"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Form */}
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off" suppressHydrationWarning>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4" suppressHydrationWarning>
            
            {/* 1. Kategori Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-red-600" />
                <span>Kategori</span>
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-white border border-slate-200 focus:border-red-500 px-3 py-2.5 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer truncate"
              >
                <option value="Semua">Semua Kategori</option>
                {activeCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Merek Dropdown (Dynamic Cascading) */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>Merek</span>
                {category !== "Semua" && (
                  <span className="text-[9px] font-normal text-slate-400">({availableBrands.length})</span>
                )}
              </label>
              <select
                value={brand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-white border border-slate-200 focus:border-red-500 px-3 py-2.5 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer truncate"
              >
                <option value="Semua">Semua Merek</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Model Dropdown (Dynamic Cascading) */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
                <CarIcon className="w-3.5 h-3.5 text-red-600" />
                <span>Model</span>
                {(category !== "Semua" || brand !== "Semua") && (
                  <span className="text-[9px] font-normal text-slate-400">({availableModels.length})</span>
                )}
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-white border border-slate-200 focus:border-red-500 px-3 py-2.5 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer truncate"
              >
                <option value="Semua">Semua Model</option>
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Kapasitas Kursi (Replaced Tahun Minimum) */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-red-600" />
                <span>Kapasitas Kursi</span>
              </label>
              <select
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-white border border-slate-200 focus:border-red-500 px-3 py-2.5 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer"
              >
                <option value="Semua">Semua Kapasitas</option>
                <option value="4-5">4 - 5 Penumpang</option>
                <option value="6-8">6 - 8 Penumpang</option>
                <option value="10+">10+ Penumpang (Minibus)</option>
              </select>
            </div>

            {/* 5. Transmisi */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-red-600" />
                <span>Transmisi</span>
              </label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full bg-slate-50/70 hover:bg-white border border-slate-200 focus:border-red-500 px-3 py-2.5 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all cursor-pointer"
              >
                <option value="Semua">Semua Transmisi</option>
                <option value="Automatic">Automatic (AT)</option>
                <option value="Manual">Manual (MT)</option>
              </select>
            </div>

            {/* 6. Tarif Maksimum Slider */}
            <div className="space-y-1.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-slate-700 font-semibold">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-red-600" />
                  <span>Maks. Tarif</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">/ Hari</span>
              </div>
              <div className="text-red-600 font-bold text-xs truncate" suppressHydrationWarning>
                {noBudgetLimit ? "Semua Tarif (Maks)" : `${formatRupiah(maxBudget)}`}
              </div>
              <div className="pt-0.5">
                <input
                  type="range"
                  min={MIN_BUDGET_FLOOR}
                  max={MAX_BUDGET_CEILING}
                  step="100000"
                  value={maxBudget}
                  onChange={(e) => handleBudgetChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
                  title="Sesuaikan batas tarif sewa harian"
                />
              </div>
            </div>

          </div>

          {/* Bottom Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
              {matchingCars.length === 0 ? (
                <span className="text-amber-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Tidak ada unit yang sesuai kombinasi filter ini
                </span>
              ) : (
                <span className="text-slate-400">
                  Temukan armada terbaik sesuai jadwal & preferensi perjalanan Anda
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={matchingCars.length === 0}
              className={`w-full sm:w-auto min-w-[180px] flex items-center justify-center gap-2 font-display font-semibold text-xs py-3 px-7 rounded-xl transition-all duration-300 text-center cursor-pointer shadow-md ${
                matchingCars.length === 0
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/35 active:scale-[0.98]"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Cari Kendaraan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
