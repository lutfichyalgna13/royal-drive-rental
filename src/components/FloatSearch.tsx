"use client";

import { useState } from "react";

import { defaultCategories, formatRupiah } from "../data/cars";

interface FloatSearchProps {
  onSearch: (filters: {
    category: string;
    brand: string;
    model: string;
    maxBudget: number;
    transmission: string;
    minYear: string;
  }) => void;
  categories?: string[];
}

export default function FloatSearch({ onSearch, categories }: FloatSearchProps) {
  const [category, setCategory] = useState("Semua");
  const [brand, setBrand] = useState("Semua");
  const [model, setModel] = useState("Semua");
  const [maxBudget, setMaxBudget] = useState(1500000);
  const [transmission, setTransmission] = useState("Semua");
  const [minYear, setMinYear] = useState("Semua");

  const activeCategories = categories && categories.length > 0 ? categories : defaultCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      category,
      brand,
      model,
      maxBudget,
      transmission,
      minYear,
    });
  };

  const formatCurrency = (val: number) => formatRupiah(val);

  return (
    <div
      id="booking-search"
      className="relative z-30 max-w-6xl mx-auto px-4 -mt-8 sm:-mt-20 md:-mt-28"
      suppressHydrationWarning
    >
      <div className="bg-white text-slate-800 p-6 rounded-2xl shadow-xl border border-slate-100/80" suppressHydrationWarning>
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off" suppressHydrationWarning>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" suppressHydrationWarning>
            
            {/* Kategori */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-700 font-semibold block">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-md text-xs text-slate-600 focus:outline-none focus:border-red-500 transition-all cursor-pointer"
              >
                <option value="Semua">Semua Kategori</option>
                {activeCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Merek */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-700 font-semibold block">
                Merek
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-md text-xs text-slate-600 focus:outline-none focus:border-red-500 transition-all cursor-pointer"
              >
                <option value="Semua">Semua Merek</option>
                <option value="Toyota">Toyota</option>
                <option value="Daihatsu">Daihatsu</option>
                <option value="Mitsubishi">Mitsubishi</option>
                <option value="Suzuki">Suzuki</option>
                <option value="Honda">Honda</option>
                <option value="Isuzu">Isuzu</option>
              </select>
            </div>

            {/* Model */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-700 font-semibold block">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-md text-xs text-slate-600 focus:outline-none focus:border-red-500 transition-all cursor-pointer"
              >
                <option value="Semua">Semua Model</option>
                <option value="Avanza">Avanza</option>
                <option value="Xenia">Xenia</option>
                <option value="Calya">Calya</option>
                <option value="Sigra">Sigra</option>
                <option value="Xpander">Xpander</option>
                <option value="Ertiga">Ertiga</option>
                <option value="Innova">Innova</option>
                <option value="Brio">Brio</option>
                <option value="Agya">Agya</option>
                <option value="Ayla">Ayla</option>
                <option value="Hiace">Hiace</option>
                <option value="Elf">Elf</option>
              </select>
            </div>

            {/* Budget maximum Slider */}
            <div className="space-y-1 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[11px] text-slate-700 font-semibold">
                <span>Tarif Sewa Maksimum</span>
              </div>
              <div className="text-red-600 font-bold text-xs mt-0.5 font-sans" suppressHydrationWarning>
                {formatCurrency(maxBudget)} / Hari
              </div>
              <input
                type="range"
                min="200000"
                max="2000000"
                step="50000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600 py-1.5"
              />
            </div>

            {/* Transmisi */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-700 font-semibold block">
                Transmisi
              </label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-md text-xs text-slate-600 focus:outline-none focus:border-red-500 transition-all cursor-pointer"
              >
                <option value="Semua">Semua Transmisi</option>
                <option value="Automatic">Automatic (AT)</option>
                <option value="Manual">Manual (MT)</option>
              </select>
            </div>

            {/* Tahun Min. */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-700 font-semibold block">
                Tahun Minimum
              </label>
              <select
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-md text-xs text-slate-600 focus:outline-none focus:border-red-500 transition-all cursor-pointer"
              >
                <option value="Semua">Semua Tahun</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-end sm:col-span-2 lg:col-span-2">
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-display font-semibold text-xs py-3 px-6 rounded-md transition-colors text-center cursor-pointer focus:outline-none"
              >
                Tampilkan Hasil
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
