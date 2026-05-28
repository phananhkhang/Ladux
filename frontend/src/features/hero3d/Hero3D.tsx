/**
 * Hero3D — composes the AuraMax-style hero with an interactive 3D laptop.
 *
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │      A U R A T E C H        ← giant translucent wordmark         │
 *   │                                                                  │
 *   │              [    3D LAPTOP CANVAS    ]   ← drag to rotate       │
 *   │                                                                  │
 *   │              ┌──────── HIGHLIGHT ─────────┐                      │
 *   │              │  ROG Zephyrus … · $2,199   │                      │
 *   │              └────────────────────────────┘                      │
 *   │                                                                  │
 *   │   tagline ········· Precision. Power. Purity. ········ Ship date │
 *   └──────────────────────────────────────────────────────────────────┘
 */
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "../../components/ui/button";
import Scene from "./Scene";
import HighlightCard from "./HighlightCard";

export interface HeroHighlight {
  slug: string;
  name: string;
  usd: number;
  vnd?: string;
}

interface Hero3DProps {
  highlight?: HeroHighlight;
}

export default function Hero3D({
  highlight = {
    slug: "rog-zephyrus-g16-aurora",
    name: "ROG Zephyrus G16 Aurora",
    usd: 2199,
    vnd: "56.074.500 đ",
  },
}: Hero3DProps) {
  return (
    <section
      className="relative min-h-[100svh] flex flex-col bg-black overflow-hidden"
      data-testid="hero-section"
    >
      {/* Ambient backdrop */}
      <div className="absolute inset-0 bg-radial-neon opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-faint [background-size:48px_48px] opacity-25 pointer-events-none" />

      {/* Stage: wordmark + 3D canvas + highlight card */}
      <div className="flex-1 relative flex flex-col items-center justify-center pt-24 md:pt-28">
        {/* Giant background wordmark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <span
            className="font-display font-extrabold text-white/[0.045] tracking-[-0.04em] leading-none whitespace-nowrap"
            style={{ fontSize: "clamp(7rem, 22vw, 22rem)" }}
            data-testid="hero-wordmark"
          >
            AURATECH
          </span>
        </motion.div>

        {/* 3D laptop stage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, delay: 0.2 }}
          className="relative z-10 w-full max-w-[1100px] aspect-[16/10] cursor-grab active:cursor-grabbing"
          data-testid="hero3d-stage"
        >
          {/* Soft neon halo behind canvas */}
          <div className="absolute inset-6 bg-neon/12 blur-[110px] rounded-full pointer-events-none" />
          <Scene />
        </motion.div>

        {/* Highlight card BELOW the model — overlapping slightly */}
        <div className="relative z-20 -mt-4 md:-mt-8" data-testid="highlight-slot">
          <HighlightCard
            slug={highlight.slug}
            name={highlight.name}
            usd={highlight.usd}
            vnd={highlight.vnd}
          />
        </div>

        {/* Tiny hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="relative z-10 mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-zinc-500"
          data-testid="drag-hint"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
          Kéo để xoay · Tự xoay khi nghỉ
        </motion.div>
      </div>

      {/* Bottom 3-col footer info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.7 }}
        className="relative z-10 section-pad pb-10 md:pb-14 pt-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-6">
          <div className="text-left">
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Hiệu năng đỉnh cao và thiết kế tối giản — được dàn dựng cho những tâm hồn cầu toàn.
            </p>
            <Link to="/shop" data-testid="hero-watch-btn" className="inline-block mt-5">
              <Button size="md" variant="outline" className="gap-2">
                <Play size={12} className="fill-current" /> Khám phá ngay
              </Button>
            </Link>
          </div>

          <div className="text-center font-display tracking-tight">
            <p className="text-base md:text-lg text-zinc-300" data-testid="hero-tagline">
              Precision. <span className="text-neon font-semibold">Power.</span>{" "}
              <span className="font-semibold">Purity.</span>
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              <span className="h-1 w-1 rounded-full bg-neon animate-pulse" />
              Bộ sưu tập Q1·2026
            </div>
          </div>

          <div className="text-left md:text-right">
            <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">
              SHIPS STARTING <span className="text-white font-bold">JAN 30</span> · LIMITED
            </div>
            <div className="text-xs text-zinc-400">Số lượng có hạn — chỉ 120 cấu hình mỗi đợt.</div>
            <Link
              to="/shop?cat=1"
              className="inline-flex items-center gap-1 text-xs text-neon hover:underline mt-3"
              data-testid="hero-preorder-link"
            >
              Đặt trước Gaming Edition <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
