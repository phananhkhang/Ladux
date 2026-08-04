import React from "react";
import laduxLogoImg from "../../assets/ladux-logo.png";

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-neutral-900 bg-black text-neutral-500 text-xs py-12">
            <div className="container mx-auto px-6 text-center space-y-4">
                <div className="flex items-center justify-center gap-3 text-white">
                    <img
                        src={laduxLogoImg}
                        alt="LADUX Logo"
                        className="h-10 w-auto object-contain rounded-[10px] opacity-90 hover:opacity-100 transition-opacity"
                    />
                    <span className="text-xl font-black tracking-widest text-white">LADUX</span>
                </div>
                <p>© {new Date().getFullYear()} LADUX. PREMIUM LAPTOP ONLY STORE. ALL RIGHTS RESERVED.</p>
            </div>
        </footer>
    );
}
