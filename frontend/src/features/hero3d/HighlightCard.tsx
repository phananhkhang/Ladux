/**
 * HighlightCard — UI card placed BELOW the 3D laptop showing the
 * featured product (label + name + USD + VND price). Pure UI, no
 * Three.js logic. Click navigates to the product detail page.
 */
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { fmtUSD, fmtVND } from "../../lib/utils";

interface HighlightCardProps {
  slug?: string;
  label?: string;
  name?: string;
  usd?: number;
  vnd?: string;
}

export default function HighlightCard({
  slug = "rog-zephyrus-g16-aurora",
  label = "HIGHLIGHT",
  name = "ROG Zephyrus G16 Aurora",
  usd = 2199,
  vnd,
}: HighlightCardProps) {
  const vndStr = vnd ?? fmtVND(usd);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10"
      data-testid="highlight-card"
    >
      <Link
        to={`/product/${slug}`}
        className="group inline-flex items-center gap-5 md:gap-7 glass rounded-2xl pl-5 md:pl-6 pr-3 py-3 md:py-4 border-white/10 hover:border-neon/45 hover:shadow-[0_0_40px_-10px_rgba(0,255,102,0.55)] transition-all duration-300"
        data-testid="highlight-card-link"
      >
        {/* Left: label + name */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.28em] font-bold text-neon mb-1">
            <Sparkles size={10} /> {label}
          </div>
          <div className="font-display text-base md:text-lg text-white leading-tight tracking-tight whitespace-nowrap">
            {name}
          </div>
        </div>

        {/* Divider */}
        <span className="hidden md:block h-10 w-px bg-white/10" />

        {/* Right: prices */}
        <div className="text-right shrink-0">
          <div className="font-display text-lg md:text-xl text-white leading-tight" data-testid="highlight-usd">
            {fmtUSD(usd)}
          </div>
          <div className="text-[11px] md:text-xs text-zinc-400 font-mono" data-testid="highlight-vnd">
            {vndStr}
          </div>
        </div>

        {/* Arrow */}
        <span className="ml-1 h-10 w-10 rounded-full bg-neon text-black inline-flex items-center justify-center group-hover:scale-105 group-hover:bg-neon-hover transition shrink-0">
          <ArrowUpRight size={16} />
        </span>
      </Link>
    </motion.div>
  );
}
