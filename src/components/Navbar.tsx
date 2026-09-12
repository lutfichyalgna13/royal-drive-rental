"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShieldAlert, Award, Search } from "lucide-react";

interface NavbarProps {
  onNavClick: (sectionId: string) => void;
  activeSection: string;
  onDashboardOpen: (role: "admin" | null) => void;
  onTrackBookingClick?: () => void;
  brandName: string;
  logoUrl?: string;
}

export default function Navbar({
  onNavClick,
  activeSection,
  onDashboardOpen,
  onTrackBookingClick,
  brandName,
  logoUrl,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "BERANDA", id: "home" },
    { label: "ARMADA", id: "fleet" },
    { label: "LAYANAN", id: "features" },
    { label: "TENTANG KAMI", id: "about" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo Brand */}
          <button
            onClick={() => onNavClick("home")}
            className="flex items-center space-x-2 group cursor-pointer focus:outline-none"
          >
            {logoUrl ? (
              <img src={logoUrl} className="w-12 h-12 object-contain transition-transform duration-300" alt="Logo" />
            ) : (
              <Award className="w-10 h-10 text-accent group-hover:rotate-12 transition-transform duration-300" />
            )}
            <div className="flex flex-col">
              <span className={`font-display font-light text-xl tracking-[0.2em] transition-colors duration-300 ${
                scrolled ? "text-slate-900" : "text-white"
              }`}>
                {brandName}
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavClick(item.id)}
                className={`font-display text-xs uppercase tracking-widest hover:text-red-500 transition-colors relative py-1 focus:outline-none ${
                  activeSection === item.id
                    ? "text-red-500 font-bold"
                    : scrolled ? "text-slate-600" : "text-slate-300"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Action Buttons (Portal) */}
          <div className="hidden lg:flex items-center space-x-3">
            {onTrackBookingClick && (
              <button
                onClick={onTrackBookingClick}
                className={`flex items-center space-x-1.5 font-display font-semibold text-xs uppercase tracking-wider px-3.5 py-2 rounded-full border transition-all cursor-pointer focus:outline-none ${
                  scrolled 
                    ? "border-slate-300 text-slate-700 hover:border-red-600 hover:text-red-600 bg-white shadow-xs" 
                    : "border-white/30 text-white hover:border-white bg-white/10 backdrop-blur-sm"
                }`}
              >
                <Search className="w-3.5 h-3.5 text-red-500" />
                <span>Lacak Booking</span>
              </button>
            )}
            <button
              onClick={() => onDashboardOpen("admin")}
              className="flex items-center space-x-2 bg-accent hover:bg-accent-hover text-white font-display font-medium text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-all cursor-pointer focus:outline-none shadow-sm shadow-accent/10"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden transition-colors focus:outline-none cursor-pointer ${
              scrolled ? "text-slate-800 hover:text-red-600" : "text-white hover:text-accent"
            }`}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#090D1A]/95 backdrop-blur-lg lg:hidden flex flex-col justify-center px-8 md:px-16"
          >
            <div className="flex flex-col space-y-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavClick(item.id);
                  }}
                  className={`text-left font-display text-lg uppercase tracking-[0.2em] focus:outline-none ${
                    activeSection === item.id ? "text-accent" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="h-[1px] bg-white/5 my-4" />

              <div className="flex flex-col space-y-3 pt-2">
                {onTrackBookingClick && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onTrackBookingClick();
                    }}
                    className="flex items-center justify-center space-x-2 bg-white/10 border border-white/20 text-white font-display font-medium text-sm uppercase tracking-widest px-6 py-3 rounded-full focus:outline-none"
                  >
                    <Search className="w-4 h-4 text-red-400" />
                    <span>Lacak Status Booking</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onDashboardOpen("admin");
                  }}
                  className="flex items-center justify-center space-x-2 bg-accent text-white font-display font-medium text-sm uppercase tracking-widest px-6 py-3 rounded-full focus:outline-none"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Console</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
