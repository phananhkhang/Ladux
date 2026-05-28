import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-white/5 bg-black" data-testid="site-footer">
      <div className="section-pad py-20 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-9 w-9 rounded-xl bg-neon/10 border border-neon/40 flex items-center justify-center font-display font-bold text-neon">A</span>
            <span className="font-display text-xl text-white">Aura<span className="text-neon">Tech</span></span>
          </div>
          <p className="text-zinc-500 leading-relaxed text-sm md:text-base max-w-md">
            Tuyển chọn laptop hiệu năng cao cấp dành cho game thủ, nhà sáng tạo và doanh nhân.
            Mỗi cấu hình là một tuyên ngôn về tốc độ — và một bản giao hưởng ánh sáng.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <span className="label-eyebrow">Thanh toán an toàn</span>
            <span className="text-zinc-600 text-xs">VNPAY · COD · Visa · Master</span>
          </div>
        </div>

        <FooterCol title="Khám phá">
          <FooterLink to="/shop">Cửa hàng</FooterLink>
          <FooterLink to="/shop?cat=1">Gaming</FooterLink>
          <FooterLink to="/shop?cat=3">Creator</FooterLink>
          <FooterLink to="/shop?cat=4">Business</FooterLink>
        </FooterCol>

        <FooterCol title="Hỗ trợ">
          <FooterLink to="/orders">Đơn hàng</FooterLink>
          <FooterLink to="/wishlist">Yêu thích</FooterLink>
          <FooterLink to="#">Bảo hành</FooterLink>
          <FooterLink to="#">Liên hệ</FooterLink>
        </FooterCol>

        <FooterCol title="Pháp lý">
          <FooterLink to="#">Điều khoản</FooterLink>
          <FooterLink to="#">Bảo mật</FooterLink>
          <FooterLink to="#">Cookies</FooterLink>
        </FooterCol>
      </div>

      <div className="section-pad py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-t border-white/5 text-xs text-zinc-600">
        <div>© {new Date().getFullYear()} AuraTech — Crafted in Hanoi, deployed worldwide.</div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
          All systems operational
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="md:col-span-2">
      <div className="label-eyebrow mb-5 text-zinc-500">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="block text-sm text-zinc-400 hover:text-neon transition">
      {children}
    </Link>
  );
}
