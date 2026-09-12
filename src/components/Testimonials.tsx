"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Play, Quote, X } from "lucide-react";
import { Testimonial } from "../data/cars";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const [index, setIndex] = useState(0);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play slideshow for testimonials and profile avatars
  useEffect(() => {
    if (isPaused || !testimonials || testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials, isPaused]);

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const current = testimonials[index] || testimonials[0];

  return (
    <section id="testimonials" className="py-24 bg-white relative border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-display text-xs uppercase tracking-[0.25em] text-accent font-semibold">
            Testimoni Pelanggan
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-slate-800 mt-3 tracking-tight">
            Apa Kata Mereka?
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-6 rounded-full" />
        </div>

        {/* Customer Profile Avatars Bar (Interactive Quick Selector) */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-10">
          {testimonials.map((item, i) => {
            const isActive = index === i;
            return (
              <button
                key={item.id || i}
                onClick={() => setIndex(i)}
                className={`group relative flex items-center space-x-2.5 px-3.5 py-2 rounded-2xl transition-all duration-300 cursor-pointer border ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-105"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
                title={`Pilih profil ulasan ${item.name}`}
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-accent shadow-sm">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {isActive && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <span className={`block font-display font-bold text-xs leading-tight ${isActive ? "text-white" : "text-slate-800"}`}>
                    {item.name.split(",")[0]}
                  </span>
                  <span className={`block text-[10px] truncate max-w-[120px] ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                    {item.role.split("PT")[0].trim() || item.role}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Testimonial Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Text Review Card (7 cols) */}
          <div 
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="lg:col-span-7 bg-slate-50 border border-slate-200/60 p-8 md:p-12 rounded-3xl flex flex-col justify-between relative shadow-sm"
          >
            <Quote className="absolute top-6 right-8 w-16 h-16 text-slate-200/25 pointer-events-none" />

            <div className="space-y-6" suppressHydrationWarning>
              {/* Star rating */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: current.rating }).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Review Text */}
              <p key={`text-${current.id}`} className="font-sans font-light text-slate-650 text-sm md:text-base leading-relaxed tracking-wide italic min-h-[80px] animate-in fade-in duration-300">
                &ldquo;{current.text}&rdquo;
              </p>
            </div>

            {/* Reviewer Meta */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200/60">
              <div key={`author-${current.id}`} className="flex items-center space-x-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-accent shadow-sm shrink-0">
                  <img 
                    src={current.avatar} 
                    alt={current.name} 
                    className="w-full h-full object-cover transition-transform duration-300" 
                  />
                </div>
                <div className="text-left">
                  <span className="font-display font-bold text-xs text-slate-800 block">
                    {current.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {current.role}
                  </span>
                </div>
              </div>

              {/* Slider Controls & Indicators */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 mr-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        index === i ? "w-6 bg-red-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={handlePrev}
                  className="w-9 h-9 rounded-full border border-slate-200 hover:border-accent/40 bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-850 transition-all cursor-pointer focus:outline-none"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-9 h-9 rounded-full border border-slate-200 hover:border-accent/40 bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-850 transition-all cursor-pointer focus:outline-none"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Video Review Thumbnail Mockup (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl overflow-hidden relative border border-slate-200 min-h-[250px] lg:min-h-0">
            {current.videoThumb ? (
              <div className="w-full h-full relative group">
                <img src={current.videoThumb} className="w-full h-full object-cover brightness-75 group-hover:brightness-50 transition-all duration-500" alt="" />
                {/* Play Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <button
                    onClick={() => {
                      if (current.videoUrl) {
                        setActiveVideoUrl(current.videoUrl);
                      } else {
                        alert("Video review belum dikonfigurasi untuk ulasan ini.");
                      }
                    }}
                    className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg cursor-pointer focus:outline-none mb-3"
                  >
                    <Play className="w-5 h-5 fill-white text-white" />
                  </button>
                  <span className="font-display font-semibold text-[10px] tracking-widest text-slate-200 uppercase block">
                    Lihat Video Review
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex flex-col justify-between text-left">
                <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-emerald-600 font-display text-[9px] uppercase tracking-widest self-start">
                  Google Verified Reviewer
                </div>
                <div>
                  <span className="font-display font-bold text-lg text-slate-800 block mb-2">
                    Google Customer Reviews
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-display font-black text-2xl text-accent">4.9 / 5.0</span>
                    <div className="flex items-center space-x-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Berdasarkan 320+ review terverifikasi Google Maps.</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {activeVideoUrl && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setActiveVideoUrl(null)}
              className="absolute top-4 right-4 z-50 bg-white/25 hover:bg-white/40 text-white p-2 rounded-full transition-colors focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={activeVideoUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
