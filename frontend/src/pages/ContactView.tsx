import React, { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { STOREFRONT_CONTACT } from "../config/storefront";

export interface ContactViewProps {
    showToast: (msg: string) => void;
}

export default function ContactView({ showToast }: ContactViewProps) {
    const [fullName, setFullName] = useState("");
    const [contact, setContact] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!STOREFRONT_CONTACT.email) {
            showToast("Email liên hệ chưa được cấu hình.");
            return;
        }
        const subject = encodeURIComponent(`Yêu cầu hỗ trợ từ ${fullName}`);
        const body = encodeURIComponent(`Họ tên: ${fullName}\nLiên hệ: ${contact}\n\n${message}`);
        window.location.href = `mailto:${STOREFRONT_CONTACT.email}?subject=${subject}&body=${body}`;
    };

    return (
        <main className="container mx-auto px-6 py-16 max-w-4xl space-y-12">
            <div className="text-center space-y-4">
                <span className="text-xs font-mono text-[#00FF41] uppercase tracking-widest">
                    CONTACT US
                </span>
                <h1 className="text-4xl font-black">LIÊN HỆ VỚI LADUX</h1>
                <p className="text-neutral-400 text-sm">
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 về các giải pháp Laptop cao cấp.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <form
                    onSubmit={handleSubmit}
                    className="p-6 bg-neutral-950 border border-neutral-900 rounded-xl space-y-4"
                >
                    <h3 className="font-bold text-sm text-white uppercase mb-4">
                        Gửi Tin Nhắn Cho Chúng Tôi
                    </h3>
                    <div>
                        <label className="block text-neutral-400 text-xs mb-1">Họ & Tên</label>
                        <input
                            required
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-neutral-400 text-xs mb-1">Email / Số Điện Thoại</label>
                        <input
                            required
                            value={contact}
                            onChange={(event) => setContact(event.target.value)}
                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-neutral-400 text-xs mb-1">Nội Dung</label>
                        <textarea
                            rows={4}
                            required
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-white"
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#00FF41] text-black py-3 rounded text-xs font-extrabold uppercase"
                    >
                        Gửi Yêu Cầu
                    </button>
                </form>

                <div className="space-y-6 text-xs">
                    <div className="flex items-start gap-4 p-4 bg-neutral-950 border border-neutral-900 rounded-xl">
                        <MapPin className="w-5 h-5 text-[#00FF41] shrink-0" />
                        <div>
                            <h4 className="font-bold text-white mb-1">Showroom Chính</h4>
                            <p className="text-neutral-400">{STOREFRONT_CONTACT.address || "Chưa cập nhật"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-neutral-950 border border-neutral-900 rounded-xl">
                        <Phone className="w-5 h-5 text-[#00FF41] shrink-0" />
                        <div>
                            <h4 className="font-bold text-white mb-1">Hotline Hỗ Trợ Khách Hàng</h4>
                            <p className="text-neutral-400 font-mono">{STOREFRONT_CONTACT.phone || "Chưa cập nhật"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-neutral-950 border border-neutral-900 rounded-xl">
                        <Mail className="w-5 h-5 text-[#00FF41] shrink-0" />
                        <div>
                            <h4 className="font-bold text-white mb-1">Email Liên Hệ</h4>
                            <p className="text-neutral-400 font-mono">
                                {STOREFRONT_CONTACT.email || "Chưa cập nhật"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
