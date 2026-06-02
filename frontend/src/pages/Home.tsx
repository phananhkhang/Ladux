import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Award, Shield, Sparkles, ChevronRight, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import ProductCard from "../components/ProductCard";
import { Products, Categories } from "../api/client";
import { fmtUSD, fmtVND, effPrice, parseSpecs } from "../lib/utils";
import { Hero3D } from "../features/hero3d";
import type { CategoryResponse, ProductResponse } from "../types/api";
import type { LucideIcon } from "lucide-react";

// Person using a laptop in dark/moody atmosphere
const HUMAN_LAPTOP =
  "https://images.unsplash.com/photo-1542744095-291d1f67b221?auto=format&fit=crop&w=2000&q=85";
const HERO_LAPTOP = HUMAN_LAPTOP;

const PARTNERS = ["INTEL", "NVIDIA", "AMD", "ASUS", "RAZER", "LENOVO", "MSI", "APPLE", "DELL", "ACER"];

export default function Home() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  useEffect(() => {
    // Use listActive (simple backend path backed by findByIsActiveTrue) to reliably load seeded data from docker postgres
    Products.listActive({ page: 0, size: 12 })
      .then((data) => setProducts(data.content || []))
      .catch(() => setProducts([]));
    Categories.list()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const featured = products.slice(0, 6);
  const deal = products.find((p) => p.discountPrice) || products[3];

  return (
    <div data-testid="home-page">
      {/* HERO — 3D laptop with AURATECH wordmark ------------------------- */}
      <Hero3D
        highlight={{
          slug: "rog-zephyrus-g16-aurora",
          name: "ROG Zephyrus G16 Aurora",
          usd: 2199,
          vnd: "56.074.500 đ",
        }}
      />

      {/* PARTNERS MARQUEE ----------------------------------------------- */}
      <section className="relative border-y border-white/5 py-6 overflow-hidden" data-testid="partners-marquee">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <span key={i} className="text-zinc-600 font-display text-2xl md:text-3xl tracking-[0.2em]">
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* MEET AURATECH — person + laptop --------------------------------- */}
      <MeetAuraTech />

      {/* CATEGORY BENTO ------------------------------------------------- */}
      <section className="section-pad py-20 md:py-28" data-testid="category-section">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <div className="label-eyebrow mb-3">Bộ sưu tập</div>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight text-white">
              Khám phá theo phong cách
            </h2>
          </div>
          <Link to="/shop" className="text-sm text-zinc-400 hover:text-neon flex items-center gap-1">
            Tất cả <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.slice(0, 6).map((c, idx) => (
            <Link
              key={c.id}
              to={`/shop?cat=${c.id}`}
              className={
                "group relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-surface border border-white/5 hover:border-neon/40 transition " +
                (idx === 0 ? "col-span-2 md:row-span-2 md:aspect-auto" : "")
              }
              data-testid={`category-${c.id}`}
            >
              <img
                src={featured[idx % Math.max(1, featured.length)]?.thumbnail || HERO_LAPTOP}
                alt={c.name}
                className="absolute inset-0 h-full w-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="relative h-full flex flex-col justify-between p-6">
                <Badge className="self-start">{c.slug}</Badge>
                <div>
                  <h3 className="font-display text-2xl md:text-3xl text-white tracking-tight mb-1">{c.name}</h3>
                  <div className="text-sm text-zinc-400 inline-flex items-center gap-1 group-hover:text-neon transition">
                    Khám phá <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED ------------------------------------------------------- */}
      <section className="section-pad py-20 md:py-28" data-testid="featured-section">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <div className="label-eyebrow mb-3">Tinh tuyển</div>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight text-white">Featured Editions</h2>
          </div>
          <Link to="/shop" className="text-sm text-zinc-400 hover:text-neon flex items-center gap-1">
            Xem tất cả <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* DEAL OF THE DAY ----------------------------------------------- */}
      {deal && (
        <section className="section-pad py-20 md:py-28" data-testid="deal-section">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center bg-gradient-to-br from-zinc-950 to-black border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-neon/10 blur-3xl" />
            <div className="relative aspect-[5/4] rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-radial-neon blur-2xl" />
              <img src={deal.thumbnail} alt={deal.name} className="relative h-full w-full object-cover" />
            </div>
            <div className="relative">
              <Badge className="mb-5"><Zap size={11} /> Deal hôm nay</Badge>
              <h2 className="font-display text-3xl md:text-5xl text-white tracking-tight leading-tight mb-4">{deal.name}</h2>
              <p className="text-zinc-400 mb-6 leading-relaxed max-w-md">
                {parseSpecs(deal.specs).cpu} · {parseSpecs(deal.specs).gpu}
              </p>
              <div className="flex items-baseline gap-4 mb-8">
                <div className="font-display text-4xl md:text-5xl text-neon">{fmtUSD(effPrice(deal))}</div>
                {deal.discountPrice && (
                  <div className="text-xl text-zinc-500 line-through">{fmtUSD(deal.basePrice)}</div>
                )}
              </div>
              <Link to={`/product/${deal.slug}`} data-testid="deal-cta">
                <Button size="lg">Mua ngay <ArrowRight size={16} /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* PROMISE BENTO ------------------------------------------------- */}
      <section className="section-pad py-20 md:py-28">
        <div className="grid md:grid-cols-3 gap-6">
          <Promise icon={Cpu} title="Cấu hình tinh tuyển" body="Mỗi máy đều được dàn dựng và stress-test bởi đội ngũ kỹ sư AuraTech trước khi đến tay khách hàng." />
          <Promise icon={Shield} title="Bảo hành 36 tháng" body="An tâm tuyệt đối với chính sách bảo hành mở rộng và đổi máy lỗi sản xuất trong 14 ngày." />
          <Promise icon={Award} title="VIP Concierge" body="Trợ lý cá nhân 1-1 tư vấn cấu hình, cài đặt và workflow tối ưu cho công việc của bạn." />
        </div>
      </section>
    </div>
  );
}

/* =====================================================================
   MEET AURATECH — Human moment with a laptop
   ===================================================================== */
function MeetAuraTech() {
  return (
    <section className="relative bg-black overflow-hidden" data-testid="meet-section">
      <div className="absolute inset-0 bg-radial-neon opacity-25 pointer-events-none" />

      {/* Full-bleed human image */}
      <div className="relative flex items-center justify-center pt-16 md:pt-24 pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-[88%] sm:w-[70%] md:w-[55%] lg:w-[45%] max-w-[820px]"
        >
          <div className="relative aspect-[3/4]">
            <div className="absolute -inset-16 bg-neon/10 blur-[100px] rounded-full" />
            <img
              src={HUMAN_LAPTOP}
              alt="Người sáng tạo với laptop AuraTech"
              className="relative z-10 w-full h-full object-cover rounded-3xl"
              draggable={false}
            />
            <div className="absolute inset-0 z-20 rounded-3xl bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>
      </div>

      {/* Text below */}
      <div className="section-pad pb-24 md:pb-32 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="label-eyebrow mb-5" data-testid="meet-eyebrow">MEET AURATECH</div>
          <h2 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-white tracking-[-0.025em] leading-[1.05] text-balance mb-8">
            Laptop cao cấp — nơi <span className="italic font-light text-zinc-400">hiệu năng,</span>
            <br />
            tinh tế và <span className="text-neon">cảm hứng</span> hội tụ.
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mt-10">
            <p className="text-zinc-400 leading-relaxed">
              Mỗi chiếc máy là một bản giao hưởng giữa chip silicon thế hệ mới, màn hình OLED
              chuẩn màu DCI-P3, và khung kim loại CNC nguyên khối — được cân chỉnh thủ công
              tại xưởng AuraTech ở Hà Nội trước khi đến tay bạn.
            </p>
            <p className="text-zinc-500 leading-relaxed">
              Từ ultrabook 14&quot; mỏng 1.2kg tới cỗ máy RTX 4090 cho game thủ chuyên nghiệp —
              chúng tôi không bán laptop, chúng tôi bán sự tự do sáng tạo.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/shop" data-testid="meet-shop-btn">
              <Button size="lg">Khám phá bộ sưu tập <ArrowRight size={16} /></Button>
            </Link>
            <Link to="/about" data-testid="meet-about-btn">
              <Button size="lg" variant="secondary">Về AuraTech</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Promise({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-8 hover:border-neon/30 transition">
      <div className="h-12 w-12 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center mb-6">
        <Icon size={20} className="text-neon" />
      </div>
      <h3 className="font-display text-xl text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
    </div>
  );
}
