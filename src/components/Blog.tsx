"use client";

import { BlogPost } from "../data/cars";
import { ArrowRight } from "lucide-react";

interface BlogProps {
  blogPosts: BlogPost[];
}

export default function Blog({ blogPosts }: BlogProps) {
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
              className="group rounded-2xl glass-card overflow-hidden flex flex-col justify-between h-full border border-slate-200"
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

                <button className="flex items-center space-x-2 font-display font-bold text-[10px] uppercase tracking-widest text-accent hover:text-red-700 transition-colors focus:outline-none cursor-pointer">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
