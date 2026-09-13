"use client";

import { Award, Phone, Mail, MapPin, MessageSquare, Video } from "lucide-react";

interface FooterProps {
  onNavClick: (id: string) => void;
  onTrackBookingClick?: () => void;
  brandName: string;
  logoUrl?: string;
  whatsappNumber: string;
  contactPhone: string;
  contactEmail: string;
  showroomAddress: string;
  googleMapsLink: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
}

export default function Footer({
  onNavClick,
  onTrackBookingClick,
  brandName,
  logoUrl,
  whatsappNumber,
  contactPhone,
  contactEmail,
  showroomAddress,
  googleMapsLink,
  instagramUrl,
  tiktokUrl,
  facebookUrl,
}: FooterProps) {
  // Extract custom maps iframe URL if present in embed code
  const iframeMatch = googleMapsLink.match(/src="([^"]+)"/);
  const mapUrl = iframeMatch ? iframeMatch[1] : (googleMapsLink.trim() || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.273641324795!2d106.8124976!3d-6.2275815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1505c21fcfd%3A0x6bde3e78a6ff603a!2sSCBD!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid");

  return (
    <footer className="bg-slate-100 border-t border-slate-200 pt-16 sm:pt-20 pb-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 mb-12 sm:mb-16">
        
        {/* COL 1: Brand (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center space-x-2">
            {logoUrl ? (
              <img src={logoUrl} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" alt="Logo" />
            ) : (
              <Award className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
            )}
            <div className="flex flex-col">
              <span className="font-display font-light text-lg sm:text-xl tracking-[0.15em] sm:tracking-[0.2em] text-slate-800">
                {brandName}
              </span>
            </div>
          </div>
          <p className="font-sans font-light text-slate-650 text-xs leading-relaxed max-w-sm">
            Royal Drive adalah penyedia layanan rental mobil mewah berskala nasional di Indonesia. Kami menghadirkan armada premium terbaik dengan kondisi prima dan supir profesional demi kenyamanan perjalanan eksklusif Anda.
          </p>
          {/* Social Icons */}
          <div className="flex items-center space-x-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-accent hover:text-accent flex items-center justify-center text-slate-500 transition-all focus:outline-none"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-accent hover:text-accent flex items-center justify-center text-slate-500 transition-all focus:outline-none"
            >
              <Video className="w-4 h-4" />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-accent hover:text-accent flex items-center justify-center text-slate-500 transition-all focus:outline-none"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>

        {/* COL 2: Quick Links (2 cols) */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2">
            Navigasi
          </h4>
          <ul className="space-y-3 font-sans text-xs text-slate-650">
            {["home", "fleet", "calculator", "features", "destinations", "testimonials", "faq"].map((id) => (
              <li key={id}>
                <button
                  onClick={() => onNavClick(id)}
                  className="hover:text-accent transition-colors capitalize focus:outline-none cursor-pointer"
                >
                  {id === "faq" ? "FAQ" : id}
                </button>
              </li>
            ))}
            {onTrackBookingClick && (
              <li>
                <button
                  onClick={onTrackBookingClick}
                  className="text-red-600 hover:text-red-700 font-bold transition-colors focus:outline-none cursor-pointer flex items-center space-x-1"
                >
                  <span>🔍 Lacak Status Booking</span>
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* COL 3: Contacts (3 cols) */}
        <div className="lg:col-span-3 space-y-6 text-left">
          <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2">
            Kontak Layanan
          </h4>
          <ul className="space-y-4 font-sans text-xs text-slate-650">
            <li className="flex items-start space-x-3">
              <Phone className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <span className="block text-slate-800 font-medium">CS 24 Jam Hotline</span>
                <span className="block text-slate-600">{contactPhone}</span>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <MessageSquare className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <span className="block text-slate-800 font-medium">WhatsApp Booking</span>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent transition-colors text-slate-600 font-bold"
                >
                  +{whatsappNumber}
                </a>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <span className="block text-slate-800 font-medium">Email Support</span>
                <span className="text-slate-600">{contactEmail}</span>
              </div>
            </li>
          </ul>
        </div>

        {/* COL 4: Alamat (3 cols) */}
        <div className="lg:col-span-3 space-y-6 text-left">
          <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-2">
            Showroom Pusat
          </h4>
          <div className="space-y-4 font-sans text-xs text-slate-650">
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span>
                {showroomAddress}
              </span>
            </div>
            {/* Real Google Maps Embed */}
            <div className="h-28 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 relative">
              <iframe
                src={mapUrl}
                className="w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright block */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-4">
        <span suppressHydrationWarning>
          &copy; {new Date().getFullYear()} {brandName} Luxury Automotive Rental. All Rights Reserved.
        </span>
        <div className="flex items-center space-x-4">
          <a href="#privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-800 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
