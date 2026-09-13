"use client";

import { useState, useEffect } from "react";
import { BlogPost } from "../data/cars";
import { ArrowRight, X, Clock, Check, Sparkles, Share2, Car } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BlogProps {
  blogPosts: BlogPost[];
}

const getArticleParagraphs = (post: BlogPost): string[] => {
  if (post.content && post.content.trim()) {
    return post.content.split("\n\n").filter(Boolean);
  }

  // Pre-configured rich editorial content for standard articles
  if (post.id === "blog-1" || post.title.toLowerCase().includes("transmisi matik")) {
    return [
      "Mengemudikan mobil bertransmisi otomatis (matik) kini telah menjadi pilihan favorit para pengemudi modern, terutama saat harus berhadapan dengan kemacetan jalanan kota besar. Tanpa perlu menginjak pedal kopling secara terus-menerus, stamina berkendara dapat terjaga lebih baik. Namun demikian, kenyamanan transmisi matik memerlukan pemahaman teknik berkendara yang benar agar komponen transmisi tetap awet dan perjalanan Anda senantiasa aman.",
      "Pertama, pahami fungsi setiap posisi tuas transmisi secara tepat. Hindari hanya mengandalkan posisi D (Drive) di segala kondisi. Ketika melintasi turunan curam dan panjang di kawasan pegunungan, segera pindahkan tuas ke posisi gigi rendah (L, 2, atau mode manual/paddle shift) untuk memanfaatkan efek engine braking alami demi mencegah piringan rem mengalami overheat (rem blong).",
      "Kedua, gunakan hanya satu kaki (kaki kanan) untuk mengoperasikan pedal rem dan gas secara bergantian. Menggunakan kaki kiri di pedal rem dan kaki kanan di pedal gas secara bersamaan sangat berbahaya karena berisiko memicu pengereman mendadak yang tidak disengaja serta mempercepat keausan kampas transmisi.",
      "Ketiga, pastikan kendaraan telah berhenti sempurna sebelum memindahkan tuas ke posisi P (Park) atau R (Reverse). Memindahkan tuas ke posisi P saat mobil masih merayap maju akan membebani pin pengunci transmisi (parking pawl) yang berisiko patah.",
      "Keempat, pindahkan tuas ke posisi netral (N) dan aktifkan rem tangan (handbrake) saat berhenti di lampu merah yang cukup lama. Hal ini membantu mengurangi beban sirkulasi fluida transmisi dan menjaga mobil tidak meluncur ke depan tanpa disengaja.",
      "Di Royal Drive, seluruh unit bertransmisi matik kami selalu mendapatkan perawatan berkala, pembaruan oli ATF berkualitas tinggi, serta inspeksi komputer diagnostik sebelum diserahkan kepada penyewa demi menjamin kenyamanan berkendara yang mulus tanpa hentakan."
    ];
  }

  if (post.id === "blog-2" || post.title.toLowerCase().includes("pantai selatan")) {
    return [
      "Jalur Lintas Pantai Selatan (Pansela) Jawa kini telah bertransformasi menjadi salah satu rute road trip paling eksotis dan memanjakan mata di Pulau Jawa. Dengan kondisi jalan aspal mulus yang membentang dari Jawa Barat, Jawa Tengah, hingga Jawa Timur, rute ini menawarkan perpaduan pemandangan bukit karst, hamparan persawahan hijau, dan bentang Samudra Hindia yang spektakuler.",
      "Salah satu pemberhentian wajib pertama adalah kawasan Kebumen dengan Pantai Menganti yang sering disandingkan dengan keindahan tebing-tebing hijau Selandia Baru. Dari atas tebing mercusuar, Anda dan keluarga dapat menikmati hembusan angin laut segar dan pemandangan ombak samudra yang biru jernih.",
      "Melanjutkan perjalanan ke arah timur menuju Pacitan, Anda akan disambut oleh Pantai Klayar yang memiliki fenomena seruling laut alami dan Pantai Kasap yang dijuluki miniatur Raja Ampat. Pasir putihnya yang bersih sangat cocok sebagai tempat bersantai dan bermain bersama anak-anak.",
      "Untuk menjelajahi kontur jalur Pansela yang memiliki variasi tanjakan dan tikungan panorama yang menantang, memilih armada mobil keluarga yang tepat adalah kunci utama. Unit seperti Toyota Innova Zenix, Mitsubishi Xpander, atau Toyota Fortuner memberikan suspensi yang sangat stabil serta kabin lega untuk menampung seluruh koper dan oleh-oleh keluarga.",
      "Pastikan Anda telah memeriksa tekanan angin ban, air radiator, serta kondisi rem sebelum berangkat. Tim Royal Drive juga menyediakan layanan sewa armada lengkap dengan sopir profesional yang berpengalaman melintasi rute wisata antar kota jika Anda ingin beristirahat menikmati pemandangan."
    ];
  }

  if (post.id === "blog-3" || post.title.toLowerCase().includes("innova reborn")) {
    return [
      "Toyota Kijang Innova Reborn bermesin diesel 2GD-FTV 2.4L telah terbukti menjadi pilihan nomor satu bagi keluarga maupun instansi bisnis di Indonesia. Selain torsi melimpah sebesar 360 Nm yang tangguh menaklukkan berbagai tanjakan curam, faktor kenyamanan kabin dan fitur keselamatan aktif maupun pasif menjadi daya tarik terbesarnya.",
      "Kijang Innova Reborn dibangun di atas sasis tangga (ladder frame) yang kokoh dipadukan struktur bodi GOA (Global Outstanding Assessment) berbahan baja berkekuatan tinggi. Struktur ini dirancang secara presisi untuk meredam energi benturan dan melindungi keselamatan seluruh penumpang di dalam kabin secara optimal.",
      "Dari sisi pengereman, mobil ini telah dibekali sistem pengereman ABS (Anti-lock Braking System) yang mencegah roda terkunci saat pengereman mendadak di permukaan aspal basah, serta Electronic Brakeforce Distribution (EBD) yang mengatur proporsi daya rem di setiap roda sesuai dengan distribusi beban penumpang.",
      "Keberadaan fitur Vehicle Stability Control (VSC) membantu menjaga stabilitas mobil saat bermanuver darurat, sementara Hill Start Assist (HSA) menahan kendaraan agar tidak merosot mundur selama beberapa detik saat hendak melaju di tanjakan curam.",
      "Tidak heran jika Innova Reborn Diesel menjadi armada rental paling dicari di garasi Royal Drive. Seluruh unit kami selalu terjaga kebersihannya, dilengkapi ban bertapak tebal, serta siap menemani agenda perjalanan penting Anda setiap saat."
    ];
  }

  return [
    post.snippet,
    "Artikel ini memberikan panduan praktis dan wawasan mendalam bagi Anda yang mengutamakan kenyamanan, keamanan, dan efisiensi dalam setiap perjalanan berkendara.",
    "Pastikan selalu merencanakan perjalanan Anda dengan matang dan memilih unit kendaraan yang tepat di Royal Drive Car Rental."
  ];
};

export default function Blog({ blogPosts }: BlogProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [copied, setCopied] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedPost]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="blog" className="py-24 bg-slate-50 relative border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-display text-xs uppercase tracking-[0.25em] text-accent font-semibold">
            Jurnal & Inspirasi
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-5xl text-slate-800 mt-3 tracking-tight">
            Artikel Terkini & Tips
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-6 rounded-full" />
        </div>

        {/* Grid cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group rounded-2xl glass-card overflow-hidden flex flex-col justify-between h-full border border-slate-200 cursor-pointer hover:shadow-xl hover:border-slate-300 transition-all duration-300"
            >
              {/* Image with zoom hover */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <span className="absolute top-4 left-4 z-10 bg-white/95 border border-slate-200 px-3 py-1 rounded-full font-display text-[9px] uppercase tracking-widest text-accent font-semibold shadow-sm">
                  {post.category}
                </span>
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Body Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-500 font-sans tracking-wide">
                    {post.date}
                  </span>
                  <h3 className="font-display font-bold text-sm sm:text-base text-slate-800 group-hover:text-accent transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="font-sans font-light text-slate-500 text-xs leading-relaxed line-clamp-3">
                    {post.snippet}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPost(post);
                  }}
                  className="flex items-center space-x-2 font-display font-bold text-[10px] uppercase tracking-widest text-accent hover:text-red-700 transition-colors focus:outline-none cursor-pointer pt-2"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* ARTICLE READER MODAL */}
      <AnimatePresence>
        {selectedPost && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col text-left"
            >
              {/* Modal Header with Hero Image */}
              <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-slate-900 shrink-0">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                {/* Floating Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-md active:scale-95"
                  aria-label="Tutup Artikel"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Category & Title on Image */}
                <div className="absolute bottom-4 left-6 right-6 z-10 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                      {selectedPost.category}
                    </span>
                    <span className="text-white/80 text-[11px] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedPost.readTime || "3 Menit Baca"}
                    </span>
                  </div>
                  <h2 className="font-display font-black text-lg sm:text-2xl text-white leading-tight drop-shadow-sm">
                    {selectedPost.title}
                  </h2>
                </div>
              </div>

              {/* Scrollable Article Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-left">
                {/* Meta Author & Publish Date */}
                <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-display font-black text-xs flex items-center justify-center shadow-xs">
                      RD
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">
                        {selectedPost.author || "Tim Editorial Royal Drive"}
                      </span>
                      <span className="text-[10px] text-slate-400">Dipublikasikan pada {selectedPost.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copied ? "Link Tersalin!" : "Bagikan"}</span>
                    </button>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      <span>Terverifikasi</span>
                    </span>
                  </div>
                </div>

                {/* Highlighted Lead Snippet */}
                <div className="p-4 bg-amber-50/60 border-l-4 border-accent rounded-r-2xl">
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                    "{selectedPost.snippet}"
                  </p>
                </div>

                {/* Article Full Paragraphs */}
                <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                  {getArticleParagraphs(selectedPost).map((paragraph, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Royal Drive Editorial Advice Box */}
                <div className="p-5 bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-display font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Catatan Perjalanan dari Royal Drive</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Demi kenyamanan dan ketenangan perjalanan Anda sekeluarga, pastikan unit kendaraan yang Anda pilih dalam kondisi prima dan terawat dengan riwayat servis resmi. Garasi Royal Drive selalu menjamin unit bersih, wangi, dengan asuransi komprehensif All-Risk.
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
                  Ingin menyewa kendaraan untuk perjalanan Anda?
                </span>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedPost(null)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    Tutup Artikel
                  </button>
                  <a
                    href="#fleet"
                    onClick={() => setSelectedPost(null)}
                    className="flex-1 sm:flex-initial px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/20 text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Lihat Pilihan Armada</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
