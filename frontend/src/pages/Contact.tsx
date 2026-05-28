import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input, Label } from "../components/ui/input";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function Contact() {
  const [form, setForm] = useState<ContactForm>({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handle =
    (key: keyof ContactForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((state) => ({ ...state, [key]: e.target.value }));
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Vui lòng điền đủ tên, email và nội dung");
      return;
    }
    // Mock: in production this would POST to /api/v1/contact
    setSent(true);
    toast.success("Đã gửi! Đội ngũ concierge sẽ phản hồi trong 24h.");
  };

  return (
    <div className="bg-black" data-testid="contact-page">
      <section className="section-pad pt-20 md:pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-neon opacity-30 pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative max-w-3xl">
          <div className="label-eyebrow mb-4">Liên hệ</div>
          <h1 className="font-display text-5xl md:text-7xl tracking-[-0.03em] text-white leading-[1.02] mb-6 text-balance">
            Đội ngũ <span className="text-neon">concierge</span> luôn sẵn sàng.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Để lại tin nhắn hoặc gọi trực tiếp — chúng tôi cam kết phản hồi trong vòng 24 giờ.
          </p>
        </motion.div>
      </section>

      <section className="section-pad pb-28">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-3 bg-surface border border-white/5 rounded-3xl p-8 md:p-10">
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-neon/10 border border-neon/40 mx-auto flex items-center justify-center mb-6">
                  <CheckCircle2 size={28} className="text-neon" />
                </div>
                <h3 className="font-display text-3xl text-white mb-3">Đã nhận tin nhắn của bạn</h3>
                <p className="text-zinc-400 mb-8">Cảm ơn {form.name || "bạn"} — chúng tôi sẽ liên hệ qua {form.email} trong 24h.</p>
                <Button onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "" }); }}>Gửi tin nhắn khác</Button>
              </motion.div>
            ) : (
              <form onSubmit={submit} data-testid="contact-form">
                <h2 className="font-display text-2xl text-white mb-1">Gửi cho chúng tôi vài dòng</h2>
                <p className="text-sm text-zinc-500 mb-8">Mọi câu hỏi về cấu hình, đặt hàng, bảo hành đều được chào đón.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Họ tên</Label>
                    <Input value={form.name} onChange={handle("name")} required data-testid="contact-name" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={handle("email")} required data-testid="contact-email" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Số điện thoại</Label>
                    <Input value={form.phone} onChange={handle("phone")} placeholder="(tuỳ chọn)" data-testid="contact-phone" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Nội dung</Label>
                    <textarea
                      value={form.message}
                      onChange={handle("message")}
                      required
                      rows={5}
                      placeholder="Mô tả nhu cầu của bạn..."
                      className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-white/10 text-white placeholder:text-zinc-600 outline-none transition focus:border-neon focus:ring-1 focus:ring-neon resize-none"
                      data-testid="contact-message"
                    />
                  </div>
                </div>
                <Button size="lg" type="submit" className="mt-6 w-full md:w-auto" data-testid="contact-submit-btn">
                  Gửi tin nhắn <Send size={14} />
                </Button>
              </form>
            )}
          </div>

          {/* Info */}
          <aside className="lg:col-span-2 space-y-3">
            <InfoCard icon={Mail}  label="Email"     value="concierge@auratech.vn" sub="Phản hồi trong 24h" />
            <InfoCard icon={Phone} label="Hotline"   value="1900 8868"             sub="8h–22h hằng ngày" />
            <InfoCard icon={MapPin} label="Showroom" value="72 Trần Thái Tông, Cầu Giấy, Hà Nội" sub="Mở cửa 9h–21h" />
            <InfoCard icon={Clock} label="Concierge VIP" value="Đặt lịch tư vấn 1-1" sub="Online hoặc trực tiếp" />
          </aside>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub: string }) {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-neon/30 transition">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon shrink-0">
          <Icon size={16} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-1">{label}</div>
          <div className="text-white font-medium">{value}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>
        </div>
      </div>
    </div>
  );
}
