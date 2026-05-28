import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { StatusPill, orderStatusTone } from "../components/StatusPill";

const stats = [
  { label: "Doanh thu hôm nay", value: "₫128.450.000", delta: "+12,4%", up: true, icon: DollarSign },
  { label: "Đơn hàng mới", value: "84", delta: "+8 đơn", up: true, icon: ShoppingBag },
  { label: "Khách hàng mới", value: "23", delta: "+4 KH", up: true, icon: Users },
  { label: "Tỷ lệ huỷ", value: "1.2%", delta: "-0,3%", up: false, icon: TrendingUp },
];

const recentOrders = [
  { id: "AT-10982", customer: "Nguyễn An", total: "₫48.900.000", status: "Đã giao" },
  { id: "AT-10981", customer: "Trần Bích", total: "₫22.150.000", status: "Đang xử lý" },
  { id: "AT-10980", customer: "Lê Cường", total: "₫35.000.000", status: "Đang giao" },
  { id: "AT-10979", customer: "Phạm Duyên", total: "₫12.450.000", status: "Đã huỷ" },
  { id: "AT-10978", customer: "Hoàng Em", total: "₫61.200.000", status: "Đã giao" },
];

// Pre-computed sparkline polyline for the revenue chart (no extra deps).
const points = [12, 18, 14, 22, 28, 24, 32, 36, 30, 42, 38, 48];
const sparkPath = points
  .map((v, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - (v / Math.max(...points)) * 90;
    return `${i === 0 ? "M" : "L"}${x},${y}`;
  })
  .join(" ");

export default function Dashboard() {
  return (
    <div className="space-y-8" data-testid="page-dashboard">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="flex items-start justify-between p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {s.label}
                </p>
                <p className="mt-2 font-display text-2xl font-semibold text-white">{s.value}</p>
                <p
                  className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
                    s.up ? "text-neon" : "text-rose-300"
                  }`}
                >
                  {s.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {s.delta}
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon ring-1 ring-neon/20">
                <s.icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Doanh thu 12 tháng</CardTitle>
            <CardDescription>Tổng doanh thu được ghi nhận theo tháng (mock)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-56 w-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <defs>
                  <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(0,255,102,0.5)" />
                    <stop offset="100%" stopColor="rgba(0,255,102,0)" />
                  </linearGradient>
                </defs>
                <path d={`${sparkPath} L100,100 L0,100 Z`} fill="url(#rev)" />
                <path d={sparkPath} fill="none" stroke="#00FF66" strokeWidth="1.2" />
              </svg>
              <div className="pointer-events-none absolute inset-0 grid grid-cols-12 opacity-30">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="border-r border-white/5 last:border-r-0" />
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-12 text-[10px] text-zinc-500">
              {["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"].map((m) => (
                <span key={m} className="text-center">{m}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <CardDescription>5 đơn mới nhất</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{o.id}</p>
                  <p className="text-xs text-zinc-500">{o.customer}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-zinc-300">{o.total}</span>
                  <StatusPill tone={orderStatusTone(o.status)}>{o.status}</StatusPill>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
