"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQItem } from "../data/cars";

interface FAQProps {
  faqs: FAQItem[];
}

export default function FAQ({ faqs }: FAQProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (idx: number) => {
    setActiveIndex(activeIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white relative border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="font-display text-xs uppercase tracking-[0.25em] text-accent font-semibold">
            Pusat Informasi
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-5xl text-slate-800 mt-3 tracking-tight">
            Pertanyaan Umum (FAQ)
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto mt-6 rounded-full" />
        </div>

        {/* Accordions */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full text-left p-4 sm:p-6 flex items-center justify-between focus:outline-none cursor-pointer hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 pr-3 sm:pr-4">
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                    <span className="font-display font-bold text-xs sm:text-sm text-slate-800">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-accent" : ""}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-slate-200 text-slate-600 font-sans text-xs sm:text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
