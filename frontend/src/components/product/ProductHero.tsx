import React from "react";
import { Zap, ChevronRight } from "lucide-react";

export interface ProductHeroProps {
    onShopNowClick: () => void;
    onAiConsultClick: () => void;
}

export default function ProductHero({ onShopNowClick, onAiConsultClick }: ProductHeroProps) {
    return (
        <section className="relative overflow-hidden pt-8 pb-12 lg:pt-12 lg:pb-16 border-b border-white/[0.08] bg-black">
            <div className="pointer-events-none absolute -right-32 top-0 h-[34rem] w-[34rem] rounded-full bg-[#00FF41]/[0.05] blur-3xl" />
            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-6 space-y-6 lg:space-y-5 ml-25 mb-15">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#00FF41]/40 bg-[#00FF41]/10 px-4 py-1.5 backdrop-blur-md">
                        <Zap className="w-3.5 h-3.5 text-[#00FF41] fill-[#00FF41]" />
                        <span className="text-[11px] font-bold font-mono tracking-wider uppercase text-[#00FF41]">
                            LADUX PREMIUM STORE — CHÍNH HÃNG NEW SEAL 100%
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                            Laptop{" "}
                            <span className="text-[#00FF41] font-script italic font-normal text-5xl sm:text-6xl lg:text-7xl">
                                perfect
                            </span>{" "}
                            for
                        </h1>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
                            anyone.
                        </h2>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-500 leading-none pt-1">
                            Laptop <span className="text-[#00FF41]">premium</span>
                        </h2>
                    </div>

                    <p className="text-neutral-400 text-sm sm:text-base max-w-lg leading-relaxed pt-1">
                        Trải nghiệm sức mạnh đỉnh cao từ chip M3/M4 Series. Chuẩn mực hiệu năng cho công việc sáng tạo, lập trình & đồ họa chuyên nghiệp.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button
                            onClick={onShopNowClick}
                            className="bg-[#00FF41] hover:bg-[#00cc34] text-black font-extrabold px-7 py-3.5 rounded-full text-sm flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-[#00FF41]/20"
                        >
                            <span>Mua ngay</span>
                            <ChevronRight className="w-4 h-4 stroke-[3]" />
                        </button>

                        <button
                            onClick={onAiConsultClick}
                            className="border-2 border-white/80 hover:border-white text-white font-bold px-7 py-3.5 rounded-full text-sm transition-colors flex items-center gap-2"
                        >
                            <span>Tư vấn AI</span>
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-6 relative flex justify-center items-center w-full h-[440px] sm:h-[480px] lg:h-[520px]">
                    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                        <iframe
                            src="https://my.spline.design/genkubgreetingrobot-7YsTVizd0MDAetdqeMaVhJKY/"
                            frameBorder="0"
                            width="100%"
                            height="100%"
                            className="w-full h-[calc(100%+50px)] -mb-[50px]"
                            title="Spline 3D Genkub Greeting Robot Animation"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
