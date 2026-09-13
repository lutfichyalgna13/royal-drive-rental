"use client";

import { Phone, ShieldCheck, Clock } from "lucide-react";

interface InteractiveMapProps {
  showroomAddress: string;
  contactPhone: string;
  googleMapsLink: string;
}

export default function InteractiveMap({ showroomAddress, contactPhone, googleMapsLink }: InteractiveMapProps) {
  // Extract custom maps iframe URL if present in embed code
  const iframeMatch = googleMapsLink.match(/src="([^"]+)"/);
  const mapUrl = iframeMatch ? iframeMatch[1] : (googleMapsLink.trim() || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.273641324795!2d106.8124976!3d-6.2275815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1505c21fcfd%3A0x6bde3e78a6ff603a!2sSCBD!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid");

  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="font-display text-xs uppercase tracking-[0.25em] text-accent font-semibold">
            Lokasi Showroom
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-5xl text-slate-800 mt-3 tracking-tight">
            Showroom Pusat Kami
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-6 rounded-full" />
          <p className="font-sans font-light text-slate-500 text-xs sm:text-sm mt-4 tracking-wide px-2 sm:px-0">
            Kunjungi showroom utama kami untuk melihat langsung koleksi armada mobil mewah kami dan melakukan konsultasi pemesanan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-stretch">
          {/* LEFT: Google Maps Embed Iframe (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden min-h-[260px] sm:min-h-[350px] md:min-h-[450px] shadow-inner relative">
            <iframe
              src={mapUrl}
              className="w-full h-full min-h-[260px] sm:min-h-[350px] md:min-h-[450px] border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* RIGHT: Showroom Details Card (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-4">
              <div className="inline-block bg-accent/10 border border-accent/20 px-3 py-1 rounded-full text-accent font-display text-[9px] uppercase tracking-widest font-semibold">
                HQ Office & Showroom
              </div>
              <h3 className="font-display font-extrabold text-xl text-slate-800">
                Showroom Utama
              </h3>
              <p className="font-sans font-light text-slate-650 text-xs leading-relaxed">
                {showroomAddress}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-accent" />
                <span className="font-sans">{contactPhone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-accent" />
                <span className="font-sans">24 Jam Operasional</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span className="font-sans">Layanan Premium & Pick-up Instan</span>
              </div>
            </div>

            <a
              href={mapUrl.includes("maps/embed") ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Showroom " + showroomAddress)}` : mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-100 hover:bg-accent border border-slate-200 hover:border-accent text-slate-700 hover:text-white font-display font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer text-center focus:outline-none block"
            >
              Buka di Google Maps
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
