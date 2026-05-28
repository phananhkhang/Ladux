import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="section-pad py-32 text-center" data-testid="not-found-page">
      <div className="label-eyebrow mb-3 text-rose-400">404</div>
      <h1 className="font-display text-5xl md:text-6xl text-white mb-4 tracking-tight">Lạc lối trong vũ trụ</h1>
      <p className="text-zinc-500 mb-8 max-w-md mx-auto">Trang bạn tìm không tồn tại. Quay về cửa hàng và khám phá những kiệt tác mới.</p>
      <Link to="/"><Button>Về trang chủ</Button></Link>
    </div>
  );
}
