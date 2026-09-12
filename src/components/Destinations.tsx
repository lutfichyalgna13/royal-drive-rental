"use client";

import { useState } from "react";
import { destinationsData, Destination } from "../data/cars";
import { Compass, Sparkles, MapPin } from "lucide-react";
import { Car } from "../data/cars";

interface DestinationsProps {
  cars: Car[];
  onSelectCar: (carId: string) => void;
}

export default function Destinations({ cars, onSelectCar }: DestinationsProps) {
  const [activeDest, setActiveDest] = useState<Destination>(destinationsData[0]);

  return (
    <section id="destinations" className="py-24 bg-slate-50 relative border-b border-slate-200/60">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.01),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-display text-xs uppercase tracking-[0.25em] text-accent font-semibold">
            Inspirasi Rute & Destinasi
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-slate-800 mt-3 tracking-tight">
            Rekomendasi Mobil Sesuai Tujuan
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-6 rounded-full" />
          <p className="font-sans font-light text-slate-500 text-sm mt-4 tracking-wide">
            Kami menyesuaikan jenis armada terbaik berdasarkan medan dan karakter dari lokasi liburan atau kunjungan kerja Anda.
          </p>
        </div>

        {/* Dynamic Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: Destination Selector Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {destinationsData.map((dest) => (
              <button
                key={dest.id}
                onClick={() => setActiveDest(dest)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between focus:outline-none cursor-pointer ${
                  activeDest.id === dest.id
                    ? "bg-accent/5 border-accent shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-850"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
                    <img src={dest.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <span className="font-display font-bold text-sm text-slate-800 block">
                      {dest.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500">
                      Rute Rekomendasi
                    </span>
                  </div>
                </div>
                <MapPin className={`w-4 h-4 transition-colors ${activeDest.id === dest.id ? "text-accent" : "text-slate-400"}`} />
              </button>
            ))}
          </div>

          {/* RIGHT: Detailed Destination Showcase & Recommended Cars (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-stretch relative overflow-hidden">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 bg-slate-950/5 z-0 pointer-events-none" />

            {/* Left: Destination Cover and description */}
            <div className="flex-1 flex flex-col justify-between z-10 relative">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-widest text-accent font-semibold flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Jelajahi Indahnya Indonesia</span>
                </span>
                <h3 className="font-display font-black text-2xl text-slate-800 leading-tight">
                  {activeDest.name}
                </h3>
                <p className="font-sans font-light text-slate-600 text-xs leading-relaxed">
                  {activeDest.description}
                </p>
              </div>

              <div className="w-full aspect-[21/9] rounded-xl overflow-hidden border border-slate-200 mt-6 md:mt-0 bg-slate-100">
                <img src={activeDest.image} className="w-full h-full object-cover" alt="" />
              </div>
            </div>

            {/* Right: Recommended Car Cards list */}
            <div className="w-full md:w-56 flex flex-col justify-center space-y-4 z-10 relative">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold block text-center md:text-left">
                Rekomendasi Armada
              </span>

              {activeDest.suitableCars.map((carId) => {
                const car = cars.find((c) => c.id === carId);
                if (!car) return null;
                return (
                  <div
                    key={car.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 aspect-video rounded-md overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                        <img src={car.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <span className="font-display font-bold text-xs text-slate-800 block truncate w-32">
                          {car.name}
                        </span>
                        <span className="text-[8px] uppercase tracking-widest text-accent">
                          {car.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectCar(car.id)}
                      className="w-full flex items-center justify-center space-x-1 bg-accent hover:bg-accent-hover text-white font-display font-semibold text-[9px] uppercase tracking-widest py-2 rounded-lg transition-all cursor-pointer focus:outline-none"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Lihat Mobil</span>
                    </button>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
