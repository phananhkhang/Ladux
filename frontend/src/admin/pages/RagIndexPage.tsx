import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Database, LoaderCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../api/adminApi";
import { AdminButton, ConfirmDialog, fieldClassName, PageHeader, Panel } from "../components/AdminUI";
import { getApiErrorMessage } from "../utils";

export default function RagIndexPage() {
  const [productId, setProductId] = useState("");
  const [indexAllOpen, setIndexAllOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const indexProductMutation = useMutation({
    mutationFn: (id: number) => adminApi.chatbot.indexProduct(id),
    onSuccess: (_, id) => {
      setError(null);
      toast.success(`Đã lập chỉ mục sản phẩm #${id}`);
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const indexAllMutation = useMutation({
    mutationFn: adminApi.chatbot.indexAllProducts,
    onSuccess: (count) => {
      setIndexAllOpen(false);
      setError(null);
      toast.success(`Đã gửi ${count.toLocaleString("vi-VN")} sản phẩm để lập chỉ mục`);
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const indexOneProduct = (event: FormEvent) => {
    event.preventDefault();
    const id = Number(productId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError("Vui lòng nhập ID sản phẩm hợp lệ.");
      return;
    }
    setError(null);
    indexProductMutation.mutate(id);
  };

  return <>
    <PageHeader
      title="Chỉ mục RAG sản phẩm"
      description="Tạo embedding cho dữ liệu sản phẩm để chatbot DeepSeek truy xuất ngữ cảnh chính xác hơn trước khi trả lời."
    />

    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

    <div className="grid gap-6 lg:grid-cols-2">
      <Panel>
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Database className="h-5 w-5" /></span>
            <div>
              <h2 className="font-extrabold text-slate-950">Lập chỉ mục một sản phẩm</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Dùng sau khi thêm hoặc chỉnh sửa một sản phẩm cụ thể.</p>
            </div>
          </div>
        </div>
        <form className="space-y-4 p-5" onSubmit={indexOneProduct}>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700" htmlFor="rag-product-id">ID sản phẩm</label>
            <input
              id="rag-product-id"
              className={fieldClassName}
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="Ví dụ: 12"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
            />
          </div>
          <AdminButton type="submit" disabled={indexProductMutation.isPending}>
            {indexProductMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Lập chỉ mục sản phẩm
          </AdminButton>
        </form>
      </Panel>

      <Panel>
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-amber-50 p-3 text-amber-600"><RefreshCw className="h-5 w-5" /></span>
            <div>
              <h2 className="font-extrabold text-slate-950">Lập chỉ mục toàn bộ</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Dùng khi khởi tạo RAG lần đầu hoặc khi catalog có nhiều thay đổi.</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Thao tác này gửi toàn bộ dữ liệu sản phẩm tới dịch vụ embedding và có thể mất vài phút, tùy số lượng sản phẩm.
          </div>
          <AdminButton tone="secondary" onClick={() => { setError(null); setIndexAllOpen(true); }}>
            <RefreshCw className="h-4 w-4" />Lập chỉ mục toàn bộ sản phẩm
          </AdminButton>
        </div>
      </Panel>
    </div>

    <ConfirmDialog
      open={indexAllOpen}
      onOpenChange={setIndexAllOpen}
      title="Lập chỉ mục toàn bộ sản phẩm?"
      description="Hệ thống sẽ tạo embedding cho mọi sản phẩm đang có trong catalog."
      confirmLabel="Bắt đầu lập chỉ mục"
      danger={false}
      isPending={indexAllMutation.isPending}
      onConfirm={() => indexAllMutation.mutate()}
    />
  </>;
}
