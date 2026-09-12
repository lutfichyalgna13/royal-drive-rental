"use client";

interface WhatsAppWidgetProps {
  whatsappNumber: string;
  brandName: string;
}

export default function WhatsAppWidget({ whatsappNumber, brandName }: WhatsAppWidgetProps) {
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Halo%20Admin%20${encodeURIComponent(brandName)}%2C%20saya%20tertarik%20untuk%20menyewa%20mobil%20premium.%20Bisa%20dibantu%3F`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 hover:-translate-y-1 transition-all duration-300 group cursor-pointer focus:outline-none"
      aria-label="Hubungi kami via WhatsApp"
    >
      {/* Decorative pulse effect */}
      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none" />
      
      {/* Icon */}
      <img src="/whatsapp-icon.png" className="w-14 h-14 relative z-10 object-contain drop-shadow-md" alt="WhatsApp CS" />
      
      {/* Tooltip on hover */}
      <span className="absolute right-16 bg-slate-900 text-white text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-md whitespace-nowrap">
        Tanya CS via WhatsApp
      </span>
    </a>
  );
}
