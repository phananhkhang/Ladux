import React from "react";
import { Link } from "react-router-dom";
import { Shield, Zap, Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import laduxLogoImg from "../../assets/ladux-logo.png";
import { ROUTES } from "../../app/routePaths";
import { STOREFRONT_CONTACT } from "../../config/storefront";

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-white/[0.08] bg-black text-neutral-400 text-xs select-none">
            {/* Top Accent Line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#00FF55] to-transparent opacity-40" />

            <div className="container mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                {/* Brand Info Column */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={laduxLogoImg}
                            alt="LADUX Logo"
                            className="h-10 w-auto object-contain rounded-xl border border-white/10"
                        />
                        <span className="text-2xl font-black font-logo tracking-[0.2em] text-[#00FF41] drop-shadow-[0_0_12px_rgba(0,255,65,0.4)]">LADUX</span>
                    </div>
                    <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
                        Hệ thống bán lẻ sỉ & lẻ laptop cao cấp, workstation đồ họa và laptop gaming chính hãng số 1. Cam kết 100% sản phẩm New Seal, nguồn gốc rõ ràng, bảo hành uy tín toàn quốc.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#00FF55]/30 bg-[#00FF55]/10 text-[10px] font-mono font-bold text-[#00FF55]">
                            <Shield className="w-3 h-3" />
                            CHÍNH HÃNG 100%
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-mono font-bold text-cyan-400">
                            <Zap className="w-3 h-3" />
                            HỎA TỐC 2H
                        </span>
                    </div>
                </div>

                {/* Quick Navigation */}
                <div className="space-y-3">
                    <h4 className="font-mono font-bold uppercase tracking-wider text-white text-xs">Về LADUX</h4>
                    <ul className="space-y-2 text-neutral-400">
                        <li>
                            <Link to={ROUTES.products} className="hover:text-[#00FF55] transition-colors">
                                Tất cả sản phẩm
                            </Link>
                        </li>
                        <li>
                            <Link to={ROUTES.cart} className="hover:text-[#00FF55] transition-colors">
                                Giỏ hàng của bạn
                            </Link>
                        </li>
                        <li>
                            <Link to={ROUTES.orders} className="hover:text-[#00FF55] transition-colors">
                                Trạng thái đơn hàng
                            </Link>
                        </li>
                        <li>
                            <Link to={ROUTES.wishlist} className="hover:text-[#00FF55] transition-colors">
                                Danh sách yêu thích
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Customer Support */}
                <div className="space-y-3">
                    <h4 className="font-mono font-bold uppercase tracking-wider text-white text-xs">Chính Sách & Hỗ Trợ</h4>
                    <ul className="space-y-2 text-neutral-400">
                        <li className="hover:text-white transition-colors cursor-pointer">Chính sách bảo hành 24 tháng</li>
                        <li className="hover:text-white transition-colors cursor-pointer">Chính sách 1 Đổi 1 trong 30 ngày</li>
                        <li className="hover:text-white transition-colors cursor-pointer">Hướng dẫn thanh toán VNPay / COD</li>
                        <li className="hover:text-white transition-colors cursor-pointer">Chính sách giao hàng toàn quốc</li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                    <h4 className="font-mono font-bold uppercase tracking-wider text-white text-xs">Liên Hệ & Hotline</h4>
                    <div className="space-y-2.5 text-neutral-400">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-[#00FF55] shrink-0" />
                            <a href={`tel:${STOREFRONT_CONTACT.phone}`} className="font-bold text-white hover:text-[#00FF55]">
                                {STOREFRONT_CONTACT.phone}
                            </a>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#00FF55] shrink-0" />
                            <span>{STOREFRONT_CONTACT.email}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-[#00FF55] shrink-0 mt-0.5" />
                            <span className="leading-snug">{STOREFRONT_CONTACT.address}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="border-t border-white/[0.06] py-6 text-center text-neutral-500 font-mono text-[11px]">
                <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p>© {new Date().getFullYear()} LADUX STORE. HIGH-PERFORMANCE LAPTOP PLATFORM. ALL RIGHTS RESERVED.</p>
                    <div className="flex items-center gap-4">
                        <span>VNPay Supported</span>
                        <span>•</span>
                        <span>Express Delivery</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
