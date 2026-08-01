import React from "react";
import { Award, Users, ShieldCheck } from "lucide-react";

export default function AboutView() {
    return (
        <main className="container mx-auto px-6 py-16 max-w-4xl space-y-16">
            <div className="text-center space-y-4">
                <span className="text-xs font-mono text-[#00FF41] uppercase tracking-widest">
                    ABOUT LADUX STORE
                </span>
                <h1 className="text-4xl sm:text-5xl font-black">
                    HỆ THỐNG PHÂN PHỐI LAPTOP CAO CẤP
                </h1>
                <p className="text-neutral-400 text-sm max-w-2xl mx-auto leading-relaxed">
                    Ladux được thành lập với sứ mệnh định hình lại thị trường Laptop tại Việt Nam — tập
                    trung chuyên biệt 100% vào các dòng Laptop cao cấp nhất thế giới.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-3">
                    <Award className="w-8 h-8 text-[#00FF41]" />
                    <h3 className="font-bold text-sm text-white">Chính Hãng 100%</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                        Cam kết chỉ bán sản phẩm Laptop chính hãng nguyên seal nhập khẩu chính ngạch.
                    </p>
                </div>
                <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-3">
                    <Users className="w-8 h-8 text-[#00FF41]" />
                    <h3 className="font-bold text-sm text-white">Chuyên Gia Tư Vấn</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                        Đội ngũ kỹ thuật viên giàu kinh nghiệm trực tiếp hỗ trợ cài đặt AI & cân màu màn hình.
                    </p>
                </div>
                <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-3">
                    <ShieldCheck className="w-8 h-8 text-[#00FF41]" />
                    <h3 className="font-bold text-sm text-white">Bảo Hành Vượt Trội</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                        Bảo hành độc quyền 24 tháng, hỗ trợ máy thay thế trong thời gian bảo hành.
                    </p>
                </div>
            </div>
        </main>
    );
}
