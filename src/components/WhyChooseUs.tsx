"use client";

import { Car, Tag, Wrench } from "lucide-react";

export default function WhyChooseUs() {
  const cards = [
    {
      icon: <Car className="w-5 h-5 text-red-600" />,
      title: "Sewa Lepas Kunci",
      description: "Kemudahan sewa lepas kunci untuk kebebasan berkendara pribadi sesuai dengan rencana dan jadwal perjalanan Anda.",
      image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=600",
      alt: "Sewa Lepas Kunci"
    },
    {
      icon: <Tag className="w-5 h-5 text-red-600" />,
      title: "Sewa Dengan Driver",
      description: "Layanan sewa didampingi pengemudi ramah dan berpengalaman untuk perjalanan bisnis atau wisata yang bebas lelah.",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600",
      alt: "Sewa Dengan Driver"
    },
    {
      icon: <Wrench className="w-5 h-5 text-red-600" />,
      title: "Wisata & Rombongan",
      description: "Solusi sewa mobil berkapasitas besar seperti Hiace dan Elf untuk liburan keluarga besar, ziarah, maupun mudik.",
      image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600",
      alt: "Wisata & Rombongan"
    }
  ];

  return (
    <section id="features" className="py-20 bg-[#F5F7FA] relative">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Header Title (optional or matching the 3 cards grid layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-slate-100/80 group"
            >
              <div className="p-6 space-y-4">
                {/* Rounded Icon in red tint */}
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  {card.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-black text-lg text-slate-800 group-hover:text-red-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="font-sans text-xs text-slate-500 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Bottom Image */}
              <div className="w-full aspect-video overflow-hidden">
                <img
                  src={card.image}
                  alt={card.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
