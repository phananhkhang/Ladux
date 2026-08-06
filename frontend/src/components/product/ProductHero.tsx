import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        },
        {
            id: 2,
            url: `${API_BASE}/uploads/banners/banner_slide2.png`,
            fallback: "/uploads/banners/banner_slide2.png",
            alt: "Ladux Store Banner Slide 2",
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

    // Tự động chuyển slide sau 5 giây nếu không di chuột vào
    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [isHovered, slides.length]);

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

    return (
        <section className="relative overflow-hidden py-4 lg:py-5 border-b border-white/[0.08] bg-black">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[22rem] w-[42rem] rounded-full bg-[#00FF41]/[0.04] blur-3xl" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div
                        onClick={onShopNowClick}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        className="relative group w-full h-[320px] sm:h-[380px] md:h-[440px] lg:h-[495px] rounded-2xl lg:rounded-3xl overflow-hidden border border-white/10 bg-neutral-950 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,65,0.08)] select-none"
                    >
                        {/* Slide Images Container */}
                        <div
                            className="flex w-full h-full transition-transform duration-700 ease-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {slides.map((slide) => (
                                <div key={slide.id} className="w-full h-full shrink-0">
                                    <img
                                        src={slide.url}
                                        alt={slide.alt}
                                        className="w-full h-full block object-fill"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = slide.fallback;
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Left Navigation Arrow */}
                        <button
                            type="button"
                            onClick={prevSlide}
                            aria-label="Previous Slide"
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-80 hover:opacity-100 hover:bg-[#00FF41] hover:text-black hover:border-[#00FF41] hover:scale-110 shadow-lg cursor-pointer"
                        >
                            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                        </button>

                        {/* Right Navigation Arrow */}
                        <button
                            type="button"
                            onClick={nextSlide}
                            aria-label="Next Slide"
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-white/20 bg-black/50 text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 opacity-80 hover:opacity-100 hover:bg-[#00FF41] hover:text-black hover:border-[#00FF41] hover:scale-110 shadow-lg cursor-pointer"
                        >
                            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                        </button>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5">
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
                                            ? "w-8 bg-[#00FF41] shadow-[0_0_12px_#00FF41]"
                                            : "w-2.5 bg-white/40 hover:bg-white/80"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
