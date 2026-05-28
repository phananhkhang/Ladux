import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Shield, Award, Sparkles, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import type { LucideIcon } from "lucide-react";

const STORY_IMG = "https://images.unsplash.com/photo-1542744095-291d1f67b221?auto=format&fit=crop&w=2000&q=85";
const STUDIO_IMG = "https://images.pexels.com/photos/5548042/pexels-photo-5548042.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1600";

export default function About() {
  return (
    <div className="bg-black" data-testid="about-page">
      {/* Hero */}
      <section className="section-pad pt-20 md:pt-28 pb-16 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-neon opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl"
        >
          <div className="label-eyebrow mb-4">Câu chuyện</div>
          <h1 className="font-display text-5xl md:text-7xl tracking-[-0.03em] text-white leading-[1.02] text-balance mb-6">
            Chúng tôi không bán laptop. <br />
            Chúng tôi bán <span className="text-neon">sự tự do</span> sáng tạo.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
            Ra mắt tại Hà Nội năm 2024, AuraTech là atelier laptop premium đầu tiên tại Đông Nam Á —
            nơi mỗi cấu hình được tuyển chọn, stress-test và tinh chỉnh thủ công bởi đội ngũ kỹ sư
            cuồng tốc độ.
          </p>
        </motion.div>
      </section>

      {/* Big visual */}
      <section className="section-pad pb-20 md:pb-28">
        <div className="relative aspect-[16/8] rounded-3xl overflow-hidden border border-white/5">
          <img src={STORY_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12">
            <Badge>Studio · Hà Nội</Badge>
            <p className="font-display text-white text-2xl md:text-4xl tracking-tight mt-4 max-w-2xl">
              Mỗi máy là kết tinh của <span className="italic font-light">120 giờ</span> kiểm thử và <span className="text-neon">3 lớp</span> đánh giá chất lượng.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-pad pb-20 md:pb-28">
        <div className="label-eyebrow mb-4">Giá trị cốt lõi</div>
        <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight mb-12">Bốn cam kết bất di bất dịch</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Value icon={Cpu}      title="Tinh tuyển" body="Không có dòng máy nào lên kệ mà chưa được team kỹ sư AuraTech ký xác nhận." />
          <Value icon={Shield}   title="Bảo hành"   body="36 tháng chính hãng, 1-đổi-1 trong 14 ngày đầu, đến tận nhà." />
          <Value icon={Sparkles} title="Tinh tế"    body="Tỉ mỉ từng tem dán, hộp đựng cho đến bộ phụ kiện đi kèm." />
          <Value icon={Award}    title="Concierge"  body="Tư vấn 1-1 trọn đời máy. Workflow, cài đặt, nâng cấp." />
        </div>
      </section>

      {/* Stats band */}
      <section className="section-pad pb-20 md:pb-28">
        <div className="bg-surface border border-white/5 rounded-3xl p-8 md:p-12 grid md:grid-cols-4 gap-8">
          <Stat n="120+" l="Cấu hình tuyển chọn" />
          <Stat n="6,400" l="Khách hàng trung thành" />
          <Stat n="36" l="Tháng bảo hành chính hãng" />
          <Stat n="24h" l="Giao nhanh nội thành" />
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad pb-28 md:pb-36 text-center">
        <h2 className="font-display text-4xl md:text-6xl text-white tracking-tight mb-6">Sẵn sàng nâng cấp?</h2>
        <p className="text-zinc-400 mb-10 max-w-xl mx-auto">Khám phá bộ sưu tập mới và để team concierge tư vấn cấu hình dành riêng cho bạn.</p>
        <Link to="/shop"><Button size="lg">Vào cửa hàng <ArrowRight size={16} /></Button></Link>
      </section>
    </div>
  );
}

function Value({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-neon/30 transition">
      <div className="h-11 w-11 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center mb-5">
        <Icon size={18} className="text-neon" />
      </div>
      <h3 className="font-display text-lg text-white mb-1">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-4xl md:text-5xl text-white tracking-tight">{n}</div>
      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 mt-2">{l}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-[11px] font-semibold tracking-wide">
      {children}
    </span>
  );
}
