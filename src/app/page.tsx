"use client";

import { useState, useEffect, useRef } from "react";
import CustomCursor from "../components/CustomCursor";
import Navbar from "../components/Navbar";
import FloatSearch, { SearchFilterState } from "../components/FloatSearch";
import FleetSection from "../components/FleetSection";
import CarDetailModal from "../components/CarDetailModal";
import CarComparison from "../components/CarComparison";
import PriceCalculator from "../components/PriceCalculator";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import InteractiveMap from "../components/InteractiveMap";
import FAQ from "../components/FAQ";
import Blog from "../components/Blog";
import Footer from "../components/Footer";
import AdminDashboard, { BookingRecord } from "../components/AdminDashboard";
import CheckoutVerificationModal, { CheckoutGuestInfo } from "../components/CheckoutVerificationModal";
import BookingTrackerModal from "../components/BookingTrackerModal";
import BookingSuccessModal from "../components/BookingSuccessModal";
import AdminLogin from "../components/AdminLogin";
import WhatsAppWidget from "../components/WhatsAppWidget";
import { playNotificationChime, sendDesktopNotification } from "../utils/notifications";
import { safeSaveBookings, purgeObsoleteStorageKeys } from "../utils/storage";
import { Car, carsData, defaultCategories, Testimonial, testimonialsData, FAQItem, faqsData, BlogPost, blogPostsData, formatRupiah, extractCarBrand, extractCarModel } from "../data/cars";
import { ShieldCheck, Headphones, ThumbsUp, CreditCard } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [compareList, setCompareList] = useState<Car[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [bgIndex, setBgIndex] = useState(0);
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>(testimonialsData);
  const [faqs, setFaqs] = useState<FAQItem[]>(faqsData);
  
  // Search filters state
  const [searchFilters, setSearchFilters] = useState<SearchFilterState | null>(null);


  const defaultBgImages = [
    "/images/hero-banner.webp",
    "/images/hero-banner.png"
  ];
  const [bgImages, setBgImages] = useState<string[]>(["/images/hero-banner.webp"]);
  const [heroTitle, setHeroTitle] = useState("Temukan Mobil Terbaik");
  const [heroSubtitle, setHeroSubtitle] = useState("SEWA MOBIL HARIAN, MINGGUAN, BULANAN DENGAN UNIT PRIMA HARGA TERBAIK.");
  const [brandName, setBrandName] = useState("RENTAL MOBIL");
  const [logoUrl, setLogoUrl] = useState("/images/logo.png");
  const [whatsappNumber, setWhatsappNumber] = useState("6281234567890");
  const [contactPhone, setContactPhone] = useState("+62 21-8080-9999");
  const [contactEmail, setContactEmail] = useState("support@rentalmobil.id");
  const [showroomAddress, setShowroomAddress] = useState("Sudirman Central Business District (SCBD) Lot 12, Senayan, Jakarta Selatan 12190");
  const [googleMapsLink, setGoogleMapsLink] = useState('<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.273641324795!2d106.8124976!3d-6.2275815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1505c21fcfd%3A0x6bde3e78a6ff603a!2sSCBD!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>');
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com");
  const [tiktokUrl, setTiktokUrl] = useState("https://tiktok.com");
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com");
  
  // Custom configurations approved by the user
  const [whatsappTemplate, setWhatsappTemplate] = useState("Halo Gino Rent Car, saya tertarik sewa mobil [Nama Mobil] untuk tanggal [Tanggal]...");
  const [rentalTerms, setRentalTerms] = useState("- KTP asli & kartu identitas sejenis\n- Surat Izin Mengemudi (SIM A) aktif\n- Deposit jaminan kerusakan wajib\n- Pengembalian unit tepat waktu");
  const [seoTitle, setSeoTitle] = useState("RENTAL MOBIL | Sewa Mobil Harian, Mingguan & Bulanan");
  const [seoDescription, setSeoDescription] = useState("Penyedia layanan rental mobil prima lepas kunci dan dengan sopir profesional. Unit terawat, harga terbaik 24 jam.");
  const [seoKeywords, setSeoKeywords] = useState("rental mobil, sewa mobil murah, sewa mobil lepas kunci, rental innova, rental avanza");

  // Dynamic Blog Posts state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Slideshow interval timer (slowed down to 8 seconds)
  useEffect(() => {
    if (bgImages.length === 0) return;
    const timer = setInterval(() => {
      setBgIndex((prev) => {
        const nextVal = (isNaN(prev) ? 0 : prev) + 1;
        return nextVal % bgImages.length;
      });
    }, 8000);
    return () => clearInterval(timer);
  }, [bgImages.length]);

  // Instantly show the newly uploaded slide when added
  useEffect(() => {
    Promise.resolve().then(() => {
      if (bgImages.length > 0) {
        setBgIndex(bgImages.length - 1);
      }
    });
  }, [bgImages.length]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSearchFilters(null); // Reset search filters when switching category tabs
  };


  // Active dashboards overlay
  const [activeDashboard, setActiveDashboard] = useState<"admin" | null>(null);

  // Hybrid checkout & fraud prevention states
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{
    carId: string;
    carName: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    withDriver: boolean;
    carImage?: string;
    pricePerDay?: number;
    category?: string;
    transmission?: string;
    seats?: number;
  } | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Customer Booking Tracking & Bukti Pemesanan states
  const [isBookingTrackerOpen, setIsBookingTrackerOpen] = useState(false);
  const [trackerBookingId, setTrackerBookingId] = useState<string | undefined>(undefined);
  const [createdBooking, setCreatedBooking] = useState<BookingRecord | null>(null);
  const [isBookingSuccessOpen, setIsBookingSuccessOpen] = useState(false);

  // Monitor scroll positioning to update active section in Navbar
  useEffect(() => {
    if (loading) return;

    const handleScroll = () => {
      const sections = ["home", "fleet", "calculator", "features", "destinations", "testimonials", "faq"];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const offsetTop = el.offsetTop;
          const offsetHeight = el.offsetHeight;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  const handleNavClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFloatSearch = (filters: SearchFilterState) => {
    setSearchFilters(filters);

    // If a category was chosen, sync category tab
    if (filters.category !== "Semua") {
      setSelectedCategory(filters.category);
    } else {
      setSelectedCategory("All");
    }

    // Scroll smoothly to the fleet list
    handleNavClick("fleet");
  };

  const handleResetSearchFilters = () => {
    setSearchFilters(null);
    setSelectedCategory("All");
  };


  // Compare toggler logic
  const handleCompareToggle = (car: Car) => {
    setCompareList((prev) => {
      const exists = prev.some((c) => c.id === car.id);
      if (exists) {
        return prev.filter((c) => c.id !== car.id);
      }
      if (prev.length >= 3) {
        alert("Anda hanya dapat membandingkan maksimal 3 mobil secara bersamaan.");
        return prev;
      }
      return [...prev, car];
    });
  };

  // Booking process flow (guest verification checkout)
  const handleCreateBooking = (bookingDetails: {
    carId: string;
    carName: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    withDriver: boolean;
    carImage?: string;
    pricePerDay?: number;
    category?: string;
    transmission?: string;
    seats?: number;
  }) => {
    // Enrich with car details if available
    const matchedCar = cars.find((c) => c.id === bookingDetails.carId);
    const enriched = {
      ...bookingDetails,
      carImage: bookingDetails.carImage || matchedCar?.image,
      pricePerDay: bookingDetails.pricePerDay || matchedCar?.pricePerDay,
      category: bookingDetails.category || matchedCar?.category,
      transmission: bookingDetails.transmission || matchedCar?.transmission,
      seats: bookingDetails.seats || matchedCar?.seats,
    };
    setPendingBooking(enriched);
    setIsVerificationOpen(true);
  };

  // Success handler for Guest OTP WhatsApp verification
  const handleVerificationSuccess = (guestInfo: CheckoutGuestInfo) => {
    if (!pendingBooking) return;

    // Calculate duration in days
    const start = new Date(pendingBooking.startDate);
    const end = new Date(pendingBooking.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Generate random realistic Indonesian car plate
    const randomPlateNum = Math.floor(1000 + Math.random() * 8999);
    const plateLetters = ["RYD", "KFL", "BJM", "WRA", "DKL"][Math.floor(Math.random() * 5)];
    const plate = `B ${randomPlateNum} ${plateLetters}`;

    const newId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const deposit = Math.round(pendingBooking.totalPrice * 0.3); // 30% DP

    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const timeStr = `${formattedDate}, ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;

    const newRecord: BookingRecord = {
      id: newId,
      client: guestInfo.fullName,
      phone: guestInfo.whatsapp,
      email: guestInfo.email,
      car: pendingBooking.carName,
      carPlate: plate,
      startDate: pendingBooking.startDate,
      endDate: pendingBooking.endDate,
      durationDays: durationDays,
      totalPrice: pendingBooking.totalPrice,
      depositAmount: deposit,
      paymentStatus: "Belum Bayar",
      paymentProofUrl: guestInfo.paymentProofUrl || undefined,
      paymentProofTime: guestInfo.paymentProofUrl ? timeStr : undefined,
      rentalType: pendingBooking.withDriver ? "Dengan Sopir" : "Lepas Kunci",
      status: "Pending",
      date: formattedDate,
      pickupLocation: guestInfo.pickupLocation || "Showroom Royal Drive",
      documents: {
        ktpNumber: guestInfo.ktpNumber,
        simNumber: guestInfo.simNumber,
        ktpUrl: guestInfo.ktpUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600",
        simUrl: guestInfo.simUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=600",
        emergencyName: guestInfo.emergencyName,
        emergencyPhone: guestInfo.emergencyPhone,
        emergencyRelation: guestInfo.emergencyRelation,
        socialMedia: guestInfo.socialMedia || "-",
        verified: false,
      },
    };

    // 1. Centralized Server Sync: POST to Next.js API route so ALL devices (HP, Laptop, PC) receive this booking!
    try {
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      }).catch((err) => {
        console.warn("Server API sync offline fallback:", err);
      });
    } catch (e) {
      console.warn("Failed to dispatch POST /api/bookings:", e);
    }

    // 2. Save to localStorage with automatic quota protection & self-healing (local device cache)
    try {
      const saved = localStorage.getItem("royal_drive_bookings_v2");
      let allBookings: BookingRecord[] = [];
      if (saved) {
        try {
          allBookings = JSON.parse(saved);
        } catch {
          allBookings = [];
        }
      }
      const updated = [newRecord, ...allBookings];
      safeSaveBookings(updated);
    } catch {
      // Graceful fallback
    }

    // Trigger Real-time Audio Chime, Desktop Notification, and Custom Event for Admin
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("royal_drive_new_booking", { detail: newRecord }));
      
      const soundSetting = localStorage.getItem("royal_drive_notif_sound");
      if (soundSetting !== "false") {
        playNotificationChime();
      }

      const formattedPrice = formatRupiah(newRecord.totalPrice);

      sendDesktopNotification(
        "🚨 Pemesanan Sewa Mobil Baru!",
        `${newRecord.client} memesan ${newRecord.car} (${newRecord.durationDays} hari - ${formattedPrice})`,
        () => setActiveDashboard("admin")
      );
    }

    setIsVerificationOpen(false);
    setPendingBooking(null);
    setSelectedCar(null);
    setCreatedBooking(newRecord);
    setIsBookingSuccessOpen(true);
  };

  const [isInitialized, setIsInitialized] = useState(false);
  const [cars, setCars] = useState<Car[]>(carsData);
  const lastSyncTimestampRef = useRef<number>(0);

  // Centralized update function that applies server settings and keeps client in sync
  const applyServerSettings = (s: any) => {
    if (!s) return;
    if (s.brandName) setBrandName(s.brandName);
    if (s.logoUrl) setLogoUrl(s.logoUrl);
    if (s.heroTitle) setHeroTitle(s.heroTitle);
    if (s.heroSubtitle) setHeroSubtitle(s.heroSubtitle);
    if (Array.isArray(s.bgImages) && s.bgImages.length > 0) setBgImages(s.bgImages);
    if (s.whatsappNumber) setWhatsappNumber(s.whatsappNumber);
    if (s.contactPhone) setContactPhone(s.contactPhone);
    if (s.contactEmail) setContactEmail(s.contactEmail);
    if (s.showroomAddress) setShowroomAddress(s.showroomAddress);
    if (s.googleMapsLink) setGoogleMapsLink(s.googleMapsLink);
    if (s.instagramUrl) setInstagramUrl(s.instagramUrl);
    if (s.tiktokUrl) setTiktokUrl(s.tiktokUrl);
    if (s.facebookUrl) setFacebookUrl(s.facebookUrl);
    if (s.whatsappTemplate) setWhatsappTemplate(s.whatsappTemplate);
    if (s.rentalTerms) setRentalTerms(s.rentalTerms);
    if (s.seoTitle) setSeoTitle(s.seoTitle);
    if (s.seoDescription) setSeoDescription(s.seoDescription);
    if (s.seoKeywords) setSeoKeywords(s.seoKeywords);

    // Fleet & Categories sync
    if (Array.isArray(s.cars) && s.cars.length > 0) {
      setCars(s.cars);
      try {
        localStorage.setItem("royal_drive_cars_v5", JSON.stringify(s.cars));
        localStorage.setItem("royal_drive_cars", JSON.stringify(s.cars));
      } catch (e) {}
    }
    if (Array.isArray(s.categories) && s.categories.length > 0) {
      setCategories(s.categories);
      try {
        localStorage.setItem("royal_drive_categories_v2", JSON.stringify(s.categories));
        localStorage.setItem("royal_drive_categories_v1", JSON.stringify(s.categories));
      } catch (e) {}
    }

    if (Array.isArray(s.testimonials) && s.testimonials.length > 0) {
      setTestimonials(s.testimonials);
      try { localStorage.setItem("royal_drive_testimonials", JSON.stringify(s.testimonials)); } catch (e) {}
    }
    if (Array.isArray(s.faqs) && s.faqs.length > 0) {
      setFaqs(s.faqs);
      try { localStorage.setItem("royal_drive_faqs", JSON.stringify(s.faqs)); } catch (e) {}
    }
    if (Array.isArray(s.blogPosts) && s.blogPosts.length > 0) {
      setBlogPosts(s.blogPosts);
      try { localStorage.setItem("royal_drive_blogPosts", JSON.stringify(s.blogPosts)); } catch (e) {}
    }

    if (s.lastUpdated) {
      lastSyncTimestampRef.current = s.lastUpdated;
    }
  };

  // Load configuration from server and fallback to localStorage on mount
  useEffect(() => {
    // 1. Instant fallback hydration from localStorage to prevent content flicker
    if (typeof window !== "undefined") {
      purgeObsoleteStorageKeys();
      const savedBrand = localStorage.getItem("royal_drive_brandName");
      if (savedBrand) setBrandName(savedBrand);

      const savedLogo = localStorage.getItem("royal_drive_logoUrl");
      if (savedLogo) setLogoUrl(savedLogo);

      const savedTitle = localStorage.getItem("royal_drive_heroTitle");
      if (savedTitle) setHeroTitle(savedTitle);

      const savedSubtitle = localStorage.getItem("royal_drive_heroSubtitle");
      if (savedSubtitle) setHeroSubtitle(savedSubtitle);

      const savedBg = localStorage.getItem("royal_drive_bgImages");
      if (savedBg) {
        try {
          const parsed = JSON.parse(savedBg);
          if (Array.isArray(parsed) && parsed.length > 0) setBgImages(parsed);
        } catch (e) {}
      }

      const savedCars = localStorage.getItem("royal_drive_cars_v5");
      if (savedCars) {
        try {
          const parsed = JSON.parse(savedCars);
          if (Array.isArray(parsed) && parsed.length >= carsData.length) setCars(parsed);
        } catch (e) {}
      }

      const savedCategories = localStorage.getItem("royal_drive_categories_v2");
      if (savedCategories) {
        try {
          const parsed = JSON.parse(savedCategories);
          if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
        } catch (e) {}
      }

      setIsInitialized(true);
    }

    // 2. Real-time fetcher function: Queries the server and syncs state if newer
    const fetchFreshSettings = async () => {
      try {
        const res = await fetch("/api/settings?t=" + Date.now(), { 
          cache: "no-store",
          headers: { "Pragma": "no-cache" }
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data?.settings) {
            const serverLastUpdated = data.settings.lastUpdated || 0;
            if (serverLastUpdated > lastSyncTimestampRef.current || lastSyncTimestampRef.current === 0) {
              applyServerSettings(data.settings);
            }
          }
        }
      } catch (err) {
        // Continue with local cache
      }
    };

    // Immediate initial sync
    fetchFreshSettings();

    // 3. Heartbeat live auto-sync every 2.5 seconds (so mobile updates live as soon as laptop dashboard saves)
    const heartbeatTimer = setInterval(fetchFreshSettings, 2500);

    // 4. Also trigger instant sync on window focus & mobile screen resume (visibilitychange)
    const handleFocus = () => fetchFreshSettings();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchFreshSettings();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(heartbeatTimer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Auto-save arrays to localStorage when changed
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try { localStorage.setItem("royal_drive_testimonials", JSON.stringify(testimonials)); } catch (e) {}
    }
  }, [testimonials, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try { localStorage.setItem("royal_drive_faqs", JSON.stringify(faqs)); } catch (e) {}
    }
  }, [faqs, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try { localStorage.setItem("royal_drive_blogPosts", JSON.stringify(blogPosts)); } catch (e) {}
    }
  }, [blogPosts, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try {
        localStorage.setItem("royal_drive_cars_v5", JSON.stringify(cars));
        localStorage.setItem("royal_drive_cars", JSON.stringify(cars));
      } catch (e) {}
    }
  }, [cars, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try {
        localStorage.setItem("royal_drive_categories_v2", JSON.stringify(categories));
        localStorage.setItem("royal_drive_categories_v1", JSON.stringify(categories));
      } catch (e) {}
    }
  }, [categories, isInitialized]);

  // Compute the displayed cars list dynamically based on active categories and search filters
  // Compute the displayed cars list dynamically based on active categories and search filters
  const displayedCars = cars.filter((car) => {
    // 1. Apply category tab filter
    if (selectedCategory !== "All" && selectedCategory !== "Semua" && car.category !== selectedCategory) {
      return false;
    }
    
    // 2. Apply float search filters if active (Strict Exact Match)
    if (searchFilters) {
      // Category match
      if (searchFilters.category !== "Semua" && car.category !== searchFilters.category) {
        return false;
      }

      // Brand exact match
      if (searchFilters.brand !== "Semua") {
        const carBrand = extractCarBrand(car.name);
        if (carBrand !== searchFilters.brand) {
          return false;
        }
      }

      // Model exact match
      if (searchFilters.model !== "Semua") {
        const carModel = extractCarModel(car.name, searchFilters.brand !== "Semua" ? searchFilters.brand : undefined);
        if (carModel !== searchFilters.model && !car.name.toLowerCase().includes(searchFilters.model.toLowerCase())) {
          return false;
        }
      }

      // Transmission match
      if (searchFilters.transmission !== "Semua" && car.transmission !== searchFilters.transmission) {
        return false;
      }

      // Seating capacity match
      if (searchFilters.seats === "4-5" && car.seats > 5) {
        return false;
      }
      if (searchFilters.seats === "6-8" && (car.seats < 6 || car.seats > 8)) {
        return false;
      }
      if (searchFilters.seats === "10+" && car.seats < 10) {
        return false;
      }

      // Budget limit (applied only if not noBudgetLimit)
      if (!searchFilters.noBudgetLimit && car.pricePerDay > searchFilters.maxBudget) {
        return false;
      }
    }
    
    return true;
  });




  return (
    <div className="relative min-h-screen selection:bg-accent selection:text-primary" suppressHydrationWarning>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      
      {/* Premium Cursor */}
      <CustomCursor />

      {/* Navigation Header */}
      <Navbar
        onNavClick={handleNavClick}
        activeSection={activeSection}
        onDashboardOpen={(role) => setActiveDashboard(role)}
        onTrackBookingClick={() => setIsBookingTrackerOpen(true)}
        brandName={brandName}
        logoUrl={logoUrl}
      />

      {/* Hero Section - Auto Changing Slideshow Background */}
      <section id="home" className="relative min-h-[80vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Background Images with Fade Transition */}
        {bgImages.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out"
            style={{
              backgroundImage: `url('${img}')`,
              opacity: bgIndex === idx ? 1 : 0,
              zIndex: bgIndex === idx ? 1 : 0,
            }}
          />
        ))}

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-slate-950/45 bg-gradient-to-t from-primary via-transparent to-black/35 z-10" />

        <div className="relative max-w-7xl mx-auto w-full px-6 lg:px-16 py-20 sm:py-28 lg:py-36 z-20 flex flex-col items-center justify-center text-center">
          {/* Sisi Tengah: Teks & Aksi */}
          <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto" suppressHydrationWarning>
            <h1 className="font-display font-black text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-white leading-tight tracking-tight drop-shadow-md">
              {heroTitle}
            </h1>
            <p className="text-white/95 text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.1em] sm:tracking-[0.2em] font-sans max-w-2xl mx-auto font-semibold drop-shadow">
              {heroSubtitle}
            </p>
            <div className="pt-4">
              <a
                href="#fleet"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-display font-bold text-xs uppercase tracking-widest px-10 py-4.5 rounded-lg shadow-lg shadow-red-600/25 transition-all duration-300 text-center"
              >
                Pesan Sekarang
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <main>
        {/* Floating Search Bar */}
        <FloatSearch
          onSearch={handleFloatSearch}
          categories={categories}
          cars={cars}
          activeFilters={searchFilters}
          onReset={handleResetSearchFilters}
        />

        {/* Fleet Grid */}
        <FleetSection
          cars={displayedCars}
          onCarSelect={(car) => setSelectedCar(car)}
          onCompareToggle={handleCompareToggle}
          compareList={compareList}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
          categories={categories}
          searchFilters={searchFilters}
          onResetFilters={handleResetSearchFilters}
        />

        {/* Price Calculator */}
        <PriceCalculator cars={cars} onBook={handleCreateBooking} />

        {/* Value Statements Counter */}
        <WhyChooseUs />

        {/* À propos Section */}
        <section id="about" className="py-20 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-16">
            {/* Sisi Kiri: Deskripsi */}
            <div className="flex-1 text-left space-y-6 max-w-2xl" suppressHydrationWarning>
              <h2 className="font-display font-black text-4xl md:text-5xl text-slate-800 tracking-tight">
                Tentang Kami
              </h2>
              <h3 className="font-display font-bold text-lg md:text-xl text-slate-700 leading-normal">
                Kami siap mendampingi setiap perjalanan penting Anda dengan standar pelayanan terbaik.
              </h3>
              <p className="text-slate-500 text-sm font-sans leading-relaxed">
                Menghadirkan pilihan unit armada terlengkap dan terawat prima, supir profesional yang ramah, serta kemudahan sistem sewa lepas kunci maupun dengan pengemudi 24 jam demi kenyamanan maksimal perjalanan Anda.
              </p>
            </div>

            {/* Sisi Kanan: Foto SUV Putih & Hitam */}
            <div className="flex-1 w-full flex items-center justify-center relative">
              <div className="relative group max-w-lg lg:max-w-xl w-full">
                <img
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"
                  alt="Tentang Kami SUV Display"
                  className="w-full h-auto object-contain rounded-2xl shadow-lg hover:scale-[1.01] transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Review Slider */}
        <Testimonials testimonials={testimonials} />

        {/* Location Pins Map */}
        <InteractiveMap showroomAddress={showroomAddress} contactPhone={contactPhone} googleMapsLink={googleMapsLink} />

        {/* Questions Accordions */}
        <FAQ faqs={faqs} />

        {/* Recent Jurnals */}
        <Blog blogPosts={blogPosts} />
      </main>

      {/* Qualité / Badges Section */}
      <section className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Badge 1 */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-xs text-slate-800 block">Kualitas Terjamin</span>
              <span className="text-[10px] text-slate-500 font-sans block">Seluruh kendaraan diservis rutin & bersertifikat.</span>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-xs text-slate-800 block">Layanan 24/7</span>
              <span className="text-[10px] text-slate-500 font-sans block">Tim dukungan kami siap membantu Anda kapan saja.</span>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <ThumbsUp className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-xs text-slate-800 block">Kepuasan Pelanggan</span>
              <span className="text-[10px] text-slate-500 font-sans block">Kenyamanan perjalanan Anda adalah prioritas kami.</span>
            </div>
          </div>

          {/* Badge 4 */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-xs text-slate-800 block">Pembayaran Aman</span>
              <span className="text-[10px] text-slate-500 font-sans block">Sistem transaksi sewa yang cepat, praktis & aman.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Layout Footer */}
      <Footer 
        onNavClick={handleNavClick} 
        onTrackBookingClick={() => setIsBookingTrackerOpen(true)}
        brandName={brandName} 
        logoUrl={logoUrl} 
        whatsappNumber={whatsappNumber}
        contactPhone={contactPhone}
        contactEmail={contactEmail}
        showroomAddress={showroomAddress}
        googleMapsLink={googleMapsLink}
        instagramUrl={instagramUrl}
        tiktokUrl={tiktokUrl}
        facebookUrl={facebookUrl}
      />

      {/* Modal: Fullscreen Car Detail Viewer */}
      {selectedCar && (
        <CarDetailModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onBook={handleCreateBooking}
          whatsappNumber={whatsappNumber}
        />
      )}

      {/* Floating Compare Widget (appears at bottom when comparing cars) */}
      <CarComparison
        compareList={compareList}
        onRemove={(car) => handleCompareToggle(car)}
        onClear={() => setCompareList([])}
        onSelectCar={(car) => setSelectedCar(car)}
        onBookCar={(car) => {
          const today = new Date().toISOString().split("T")[0];
          handleCreateBooking({
            carId: car.id,
            carName: car.name,
            startDate: today,
            endDate: today,
            totalPrice: car.pricePerDay,
            withDriver: false,
            carImage: car.image,
            pricePerDay: car.pricePerDay,
            category: car.category,
            transmission: car.transmission,
            seats: car.seats,
          });
        }}
        whatsappNumber={whatsappNumber}
      />



      {/* Overlay: Administrator Portal Console */}
      {activeDashboard === "admin" && (
        isAdminAuthenticated ? (
          <AdminDashboard
            cars={cars}
            setCars={setCars}
            categories={categories}
            setCategories={setCategories}
            testimonials={testimonials}
            setTestimonials={setTestimonials}
            faqs={faqs}
            setFaqs={setFaqs}
            heroTitle={heroTitle}
            setHeroTitle={setHeroTitle}
            heroSubtitle={heroSubtitle}
            setHeroSubtitle={setHeroSubtitle}
            bgImages={bgImages}
            setBgImages={setBgImages}
            brandName={brandName}
            setBrandName={setBrandName}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            whatsappNumber={whatsappNumber}
            setWhatsappNumber={setWhatsappNumber}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            showroomAddress={showroomAddress}
            setShowroomAddress={setShowroomAddress}
            googleMapsLink={googleMapsLink}
            setGoogleMapsLink={setGoogleMapsLink}
            instagramUrl={instagramUrl}
            setInstagramUrl={setInstagramUrl}
            tiktokUrl={tiktokUrl}
            setTiktokUrl={setTiktokUrl}
            facebookUrl={facebookUrl}
            setFacebookUrl={setFacebookUrl}
            whatsappTemplate={whatsappTemplate}
            setWhatsappTemplate={setWhatsappTemplate}
            rentalTerms={rentalTerms}
            setRentalTerms={setRentalTerms}
            seoTitle={seoTitle}
            setSeoTitle={setSeoTitle}
            seoDescription={seoDescription}
            setSeoDescription={setSeoDescription}
            seoKeywords={seoKeywords}
            setSeoKeywords={setSeoKeywords}
            blogPosts={blogPosts}
            setBlogPosts={setBlogPosts}
            onClose={() => {
              setActiveDashboard(null);
              setIsAdminAuthenticated(false); // reset auth for demo reload
            }}
          />
        ) : (
          <AdminLogin
            onLoginSuccess={() => setIsAdminAuthenticated(true)}
            onClose={() => setActiveDashboard(null)}
          />
        )
      )}

      {/* Modal Overlay: Guest Verification Anti-Fraud */}
      <CheckoutVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        bookingDetails={pendingBooking}
        onSuccess={handleVerificationSuccess}
      />

      {/* Modal Overlay: Customer Online Booking Tracker */}
      <BookingTrackerModal
        isOpen={isBookingTrackerOpen}
        onClose={() => {
          setIsBookingTrackerOpen(false);
          setTrackerBookingId(undefined);
        }}
        whatsappNumber={whatsappNumber}
        initialBookingId={trackerBookingId}
      />

      {/* Modal Overlay: Bukti Konfirmasi Pemesanan & Success Confirmation */}
      <BookingSuccessModal
        isOpen={isBookingSuccessOpen}
        onClose={() => setIsBookingSuccessOpen(false)}
        booking={createdBooking}
        whatsappNumber={whatsappNumber}
        onOpenTracker={(bookingId) => {
          setTrackerBookingId(bookingId);
          setIsBookingTrackerOpen(true);
        }}
      />

      {/* Floating WhatsApp Chat CS Widget */}
      <WhatsAppWidget whatsappNumber={whatsappNumber} brandName={brandName} />
    </div>
  );
}
