import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, Zap, CreditCard, RefreshCw } from "lucide-react";

export interface ProductHeroProps {
    onShopNowClick?: () => void;
    onAiConsultClick?: () => void;
}

export default function ProductHero({ onShopNowClick }: ProductHeroProps) {
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1").replace("/api/v1", "");

    const slides = [
        {
            id: 1,
            url: `${API_BASE}/uploads/banners/banner_slide1.png`,
            fallback: "/uploads/banners/banner_slide1.png",
            alt: "Ladux Store Banner Slide 1",
            badge: "LADUX ULTIMATE GAMING & WORKSTATION",
        },
        {
            id: 2,
            url: `${API_BASE}/uploads/banners/banner_slide2.png`,
            fallback: "/uploads/banners/banner_slide2.png",
            alt: "Ladux Store Banner Slide 2",
            badge: "SIÊU PHẨM LAPTOP ULTRABOOK CAO CẤP",
        },
    ];

    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const touchStartX = useRef<number | null>(null);

    const prevSlide = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const nextSlide = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;

        if (Math.abs(diff) > 40) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        touchStartX.current = null;
    };

    const benefits = [
        {
            icon: ShieldCheck,
            title: "Chính Hãng New Seal 100%",
            desc: "Bảo hành 12 - 24 tháng chính hãng",
        },
        {
            icon: Zap,
            title: "Giao Hàng Hỏa Tốc",
            desc: "Nội thành nhận ngay trong 2h",
        },
        {
            icon: CreditCard,
            title: "Trả Góp 0% Lãi Suất",
            desc: "Thủ tục duyệt nhanh trong 5 phút",
        },
        {
            icon: RefreshCw,
            title: "1 Đổi 1 Trong 30 Ngày",
            desc: "Lỗi NSX đổi mới lập tức",
        },
    ];

    return (
        <section className="relative overflow-hidden py-3 lg:py-4 border-b border-white/[0.08] bg-black">
            {/* Ambient Cyber Background Glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[22rem] w-[45rem] rounded-full bg-[#00FF55]/[0.05] blur-3xl" />
            <div className="pointer-events-none absolute right-10 top-10 h-72 w-72 rounded-full bg-cyan-500/[0.03] blur-3xl" />

            <div className="container mx-auto px-6 sm:px-10 lg:px-16 space-y-3.5 sm:space-y-4">
                {/* ── Main Banner Carousel Container ── */}
                <div className="max-w-6xl mx-auto">
                    <div
                        onClick={onShopNowClick}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        className="relative group w-full h-[220px] sm:h-[280px] md:h-[330px] lg:h-[370px] rounded-2xl lg:rounded-3xl overflow-hidden border border-white/10 bg-neutral-950 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,85,0.1)] select-none"
                    >
                        {/* Slide Images Container */}
                        <div
                            className="flex w-full h-full transition-transform duration-700 ease-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {slides.map((slide) => (
                                <div key={slide.id} className="w-full h-full shrink-0 relative">
                                    <img
                                        src={slide.url}
                                        alt={slide.alt}
                                        className="w-full h-full block object-fill rounded-2xl lg:rounded-3xl"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = slide.fallback;
                                        }}
                                    />
                                    {/* Top Glass Badge */}
                                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 inline-flex items-center gap-2 rounded-full border border-[#00FF55]/40 bg-black/65 backdrop-blur-md px-3.5 py-1.5 shadow-lg">
                                        <div className="h-2 w-2 rounded-full bg-[#00FF55] animate-pulse" />
                                        <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#00FF55]">
                                            {slide.badge}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Left Navigation Arrow */}
                        <button
                            type="button"
                            onClick={prevSlide}
                            aria-label="Previous Slide"
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-white/20 bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-70 hover:opacity-100 hover:bg-[#00FF55] hover:text-black hover:border-[#00FF55] hover:scale-110 shadow-xl cursor-pointer"
                        >
                            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                        </button>

                        {/* Right Navigation Arrow */}
                        <button
                            type="button"
                            onClick={nextSlide}
                            aria-label="Next Slide"
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-white/20 bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-70 hover:opacity-100 hover:bg-[#00FF55] hover:text-black hover:border-[#00FF55] hover:scale-110 shadow-xl cursor-pointer"
                        >
                            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                        </button>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(idx);
                                    }}
                                    aria-label={`Go to slide ${idx + 1}`}
                                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                        currentIndex === idx
                                            ? "w-8 bg-[#00FF55] shadow-[0_0_12px_#00FF55]"
                                            : "w-2.5 bg-white/40 hover:bg-white/80"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Sub-Hero Feature Assurance Cards ── */}
                <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
                    {benefits.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-950/80 p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#00FF55]/40 hover:bg-neutral-900/90 hover:shadow-[0_10px_25px_rgba(0,255,85,0.08)] flex items-center gap-3.5"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#00FF55]/30 bg-[#00FF55]/10 text-[#00FF55] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#00FF55] group-hover:text-black">
                                    <Icon className="h-5 w-5 stroke-[2.2]" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00FF55] transition-colors truncate">
                                        {item.title}
                                    </h4>
                                    <p className="text-[10px] sm:text-xs text-neutral-400 truncate mt-0.5 font-mono">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
