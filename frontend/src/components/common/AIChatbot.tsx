import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, CheckCheck, ChevronRight, Laptop, ShoppingBag, Tag, Headphones } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import botAvatarImg from "../../assets/avatar_chatbot.png";
import { useStorefront } from "../../app/StorefrontProvider";
import { productPath } from "../../app/routePaths";
import { LaptopProduct } from "../../types";

interface Message {
    id: string;
    sender: "bot" | "user";
    text: string;
    timestamp: string;
    products?: LaptopProduct[];
}

const PRESET_PILLS = [
    { label: "Tư vấn laptop", query: "Tư vấn cho mình laptop đồ họa tầm 25 triệu nhé.", icon: Laptop },
    { label: "Kiểm tra đơn hàng", query: "Cho mình kiểm tra trạng thái đơn hàng.", icon: ShoppingBag },
    { label: "Khuyến mãi hôm nay", query: "Hôm nay cửa hàng có chương trình khuyến mãi gì?", icon: Tag },
    { label: "Liên hệ hỗ trợ", query: "Cho mình thông tin liên hệ hỗ trợ khách hàng.", icon: Headphones },
];

export default function AIChatbot() {
    const navigate = useNavigate();
    const location = useLocation();
    const { allDisplayProducts, isLoggedIn, userName } = useStorefront();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "msg-1",
            sender: "bot",
            text: "Xin chào! 👋\nMình có thể hỗ trợ gì cho bạn hôm nay?",
            timestamp: getFormattedTime(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    function getFormattedTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    // Automatically close chatbot window when navigating to a new route
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Close chatbot window on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    // Auto-scroll messages
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen, isTyping]);

    const handleSendMessage = (textToSend?: string) => {
        const query = (textToSend || inputValue).trim();
        if (!query) return;

        const userMsg: Message = {
            id: `msg-${Date.now()}`,
            sender: "user",
            text: query,
            timestamp: getFormattedTime(),
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!textToSend) setInputValue("");
        setIsTyping(true);

        setTimeout(() => {
            const botResponse = generateAIResponse(query, allDisplayProducts, userName, isLoggedIn);
            setMessages((prev) => [...prev, botResponse]);
            setIsTyping(false);
        }, 700);
    };

    function generateAIResponse(
        query: string,
        catalog: LaptopProduct[],
        userName?: string,
        isLoggedIn?: boolean
    ): Message {
        const lower = query.toLowerCase();
        const timestamp = getFormattedTime();

        if (lower.includes("25 triệu") || lower.includes("đồ họa") || lower.includes("tư vấn laptop") || lower.includes("gaming")) {
            const suitableProducts = catalog.filter((p) => p.price >= 18000000 && p.price <= 32000000).slice(0, 3);
            return {
                id: `bot-${Date.now()}`,
                sender: "bot",
                text: `Dạ được ạ! 🥳\nLADUX có nhiều mẫu laptop đồ họa phù hợp trong tầm giá 25 triệu. Bạn có cần ưu tiên về cấu hình hay thương hiệu nào không ạ?`,
                products: suitableProducts.length > 0 ? suitableProducts : catalog.slice(0, 2),
                timestamp,
            };
        }

        if (lower.includes("đơn hàng") || lower.includes("kiểm tra")) {
            if (isLoggedIn) {
                return {
                    id: `bot-${Date.now()}`,
                    sender: "bot",
                    text: `Dạ chào ${userName || "bạn"}, bạn có thể xem chi tiết trạng thái đơn hàng trong mục **Tài khoản > Lịch sử đơn hàng** hoặc gửi Mã đơn hàng tại đây để mình tra cứu nhé! 📦`,
                    timestamp,
                };
            }
            return {
                id: `bot-${Date.now()}`,
                sender: "bot",
                text: "Dạ, vui lòng đăng nhập tài khoản LADUX của bạn để kiểm tra danh sách đơn hàng đã đặt, hoặc gửi mã đơn hàng tại đây nhé! 😊",
                timestamp,
            };
        }

        if (lower.includes("khuyến mãi") || lower.includes("ưu đãi") || lower.includes("giảm giá")) {
            return {
                id: `bot-${Date.now()}`,
                sender: "bot",
                text: `🔥 **Chương trình Ưu đãi HOT nhất hôm nay:**\n- Giảm trực tiếp lên tới 15% cho Laptop Gaming & Đồ họa.\n- Tặng Balo LADUX Premium + Chuột không dây.\n- Miễn phí giao hàng hỏa tốc toàn quốc & Trả góp 0% qua VNPay!`,
                timestamp,
            };
        }

        if (lower.includes("liên hệ") || lower.includes("hỗ trợ") || lower.includes("hotline")) {
            return {
                id: `bot-${Date.now()}`,
                sender: "bot",
                text: `📞 **Thông tin hỗ trợ LADUX:**\n- Hotline: 1900 8888 (8:00 - 21:30)\n- Email CSKH: support@ladux.vn\n- Showroom: 123 Đường Công Nghệ, Q. Cầu Giấy, Hà Nội`,
                timestamp,
            };
        }

        const matched = catalog.filter((p) => {
            const pName = p.name.toLowerCase();
            const pBrand = p.brand.toLowerCase();
            return lower.split(" ").some((word) => word.length > 2 && (pName.includes(word) || pBrand.includes(word)));
        });

        if (matched.length > 0) {
            return {
                id: `bot-${Date.now()}`,
                sender: "bot",
                text: `Dạ, dựa trên yêu cầu của bạn, LADUX xin gợi ý một số mẫu laptop phù hợp bên dưới ạ:`,
                products: matched.slice(0, 3),
                timestamp,
            };
        }

        return {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: `Cảm ơn câu hỏi của bạn! LADUX AI Assistant có thể giúp bạn tư vấn chọn cấu hình laptop, kiểm tra đơn hàng, khuyến mãi hoặc bảo hành. Bạn hãy thử chọn các gợi ý bên dưới hoặc gửi tin nhắn nhé! ⚡`,
            timestamp,
        };
    }

    return (
        <div className={`fixed z-50 flex flex-col items-center gap-3 select-none ${isOpen ? "bottom-5 right-5" : "bottom-6 right-3 sm:right-4"}`}>
            {/* 1. TOP: CHATBOT ICON BUTTON */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    title="Bấm để mở Chatbot"
                    className="group relative flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 cursor-pointer items-center justify-center rounded-full overflow-hidden border-2 border-[#48cae4] bg-[#0c1820] shadow-lg transition-transform hover:scale-110 focus:outline-none"
                >
                    <img
                        src={botAvatarImg}
                        alt="LADUX AI Assistant"
                        className="h-full w-full object-cover pointer-events-none"
                    />
                </button>
            )}

            {/* EXPANDED CHATBOT WINDOW */}
            {isOpen && (
                <div className="flex h-[580px] w-[340px] sm:w-[350px] max-w-[95vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                    {/* CHAT HEADER */}
                    <div className="flex items-center justify-between bg-[#48cae4] px-4 py-3 text-white shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 flex-shrink-0 rounded-full overflow-hidden border-2 border-white/80 shadow-sm bg-[#0a1217]">
                                <img
                                    src={botAvatarImg}
                                    alt="Avatar"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-base font-bold tracking-wide text-white leading-snug">
                                    Hỗ trợ trực tuyến
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#00ff66] shadow-sm" />
                                    <span>Online</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                            title="Đóng Chatbot"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* CHAT MESSAGES BODY */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 custom-scrollbar w-full max-w-full">
                        {messages.map((msg) => (
                            <div key={msg.id} className="space-y-2 w-full max-w-full overflow-hidden">
                                {msg.sender === "bot" ? (
                                    <div className="flex justify-start w-full max-w-[90%]">
                                        <div className="rounded-2xl rounded-tl-none bg-[#f1f3f5] border border-slate-200/60 p-3.5 text-sm text-slate-800 leading-relaxed shadow-sm w-full overflow-hidden">
                                            <p className="whitespace-pre-line break-words overflow-wrap-anywhere">
                                                {msg.text}
                                            </p>

                                            {/* Product Suggestions Cards */}
                                            {msg.products && msg.products.length > 0 && (
                                                <div className="mt-3 space-y-2 pt-2 border-t border-slate-200/80 w-full max-w-full overflow-hidden">
                                                    {msg.products.map((prod) => (
                                                        <div
                                                            key={prod.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsOpen(false);
                                                                navigate(productPath(prod.id));
                                                            }}
                                                            className="group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2 hover:border-[#48cae4] hover:shadow-sm cursor-pointer transition-all w-full max-w-full overflow-hidden"
                                                        >
                                                            <img
                                                                src={prod.images?.[0] || ""}
                                                                alt={prod.name}
                                                                className="h-11 w-11 flex-shrink-0 rounded-lg object-contain bg-slate-100 p-1"
                                                            />
                                                            <div className="flex-1 min-w-0 overflow-hidden">
                                                                <h4 className="text-xs font-semibold text-slate-800 truncate max-w-full group-hover:text-[#48cae4] transition-colors">
                                                                    {prod.name}
                                                                </h4>
                                                                <p className="text-xs font-bold text-[#0ea5e9] mt-0.5">
                                                                    {prod.price.toLocaleString("vi-VN")} đ
                                                                </p>
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-[#48cae4] transition-colors" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <span className="block mt-1.5 text-[10px] text-slate-400 text-right">
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    /* User Message */
                                    <div className="flex justify-end w-full">
                                        <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-[#48cae4] p-3 text-sm text-white shadow-sm font-medium">
                                            <p className="whitespace-pre-line leading-relaxed break-words overflow-wrap-anywhere">
                                                {msg.text}
                                            </p>
                                            <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-white/80">
                                                <span>{msg.timestamp}</span>
                                                <CheckCheck className="h-3.5 w-3.5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* PRESET QUICK PILLS - 2x2 GRID */}
                        <div className="pt-2 pb-1 grid grid-cols-2 gap-2 w-full">
                            {PRESET_PILLS.map((pill, idx) => {
                                const IconComponent = pill.icon;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendMessage(pill.query)}
                                        className="flex items-center gap-2 rounded-xl border border-[#48cae4]/30 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:border-[#48cae4] hover:bg-[#48cae4]/10 active:scale-95 text-left w-full truncate shadow-xs"
                                    >
                                        <IconComponent className="h-4 w-4 text-[#48cae4] flex-shrink-0" />
                                        <span className="truncate">{pill.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 pl-2">
                                <span className="h-2 w-2 animate-ping rounded-full bg-[#48cae4]" />
                                <span>Đang soạn phản hồi...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT FOOTER AREA */}
                    <div className="border-t border-slate-100 bg-white p-3 w-full">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex items-center gap-2 w-full"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Nhập câu hỏi của bạn..."
                                className="flex-1 min-w-0 rounded-xl border border-[#48cae4]/40 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#48cae4] focus:outline-none focus:ring-2 focus:ring-[#48cae4]/30 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#48cae4] text-white hover:bg-[#3db8d1] disabled:opacity-40 disabled:hover:bg-[#48cae4] transition-all shadow-sm active:scale-95"
                                title="Gửi tin nhắn"
                            >
                                <Send className="h-5 w-5 ml-0.5 text-white" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. MIDDLE: ZALO FLOATING BUTTON */}
            {!isOpen && (
                <a
                    href="https://zalo.me/0352060306"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Hỗ trợ qua Zalo"
                    className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#0084ff] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#0073e6] active:scale-95"
                >
                    <span className="text-[13px] font-black leading-none sm:text-sm">Zalo</span>
                </a>
            )}

            {/* 3. BOTTOM: TELEGRAM FLOATING BUTTON */}
            {!isOpen && (
                <a
                    href="https://t.me/phananhkhang"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Hỗ trợ qua Telegram"
                    className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#2AABEE] shadow-lg transition-transform hover:scale-110 hover:bg-[#229edc] active:scale-95"
                >
                    <svg className="pointer-events-none h-7 w-7 sm:h-8 sm:w-8" viewBox="0 20 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M98 175c-3.887 0-3.227-1.464-4.568-5.17l-11.56-38.016 88.665-52.616c4.077-2.705.882-4.215-3.568-1.576l-109.52 69.176-35.313-11.036c-7.68-2.4-7.808-7.68 1.6-11.36l138.08-53.2c6.4-2.4 12 1.44 9.6 11.2l-23.52 110.88c-1.76 8.32-6.72 10.4-13.6 6.56l-38.88-28.64-18.72 18.08c-2.08 2.08-3.84 3.84-7.84 3.84z" fill="#ffffff" />
                    </svg>
                </a>
            )}
        </div>
    );
}
