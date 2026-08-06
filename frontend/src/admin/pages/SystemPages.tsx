import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Edit3, LoaderCircle, Plus, Send, ShieldAlert, Trash2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../app/components/ui/dialog";
import { adminApi } from "../api/adminApi";
import { AdminButton, AdminTable, ConfirmDialog, fieldClassName, PageHeader, PaginationBar, Panel, StatusBadge, textareaClassName, type AdminColumn } from "../components/AdminUI";
import { adminQueryKeys } from "../queryKeys";
import type { ColorRequest, ColorResponse, NotificationRequest, NotificationResponse, NotificationType, UserResponse } from "../types";
import { formatBackendDateTime, getApiErrorMessage } from "../utils";

export function ColorsPage() {
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const page = Math.max(0, Number(params.get("page") ?? 0));
  const size = [10, 20, 50, 100].includes(Number(params.get("size"))) ? Number(params.get("size")) : 20;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ColorResponse | null>(null);
  const [deleting, setDeleting] = useState<ColorResponse | null>(null);
  const [form, setForm] = useState<ColorRequest>({ name: "", hexCode: "#000000" });
  const [error, setError] = useState<string | null>(null);
  const query = useQuery({
    queryKey: adminQueryKeys.resource("colors", { page, size }),
    queryFn: () => adminApi.colors.list({ page, size, sort: "name,asc" }),
    placeholderData: (previous) => previous,
  });
  const invalidateColors = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "colors"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  };
  const mutation = useMutation({ mutationFn: () => editing ? adminApi.colors.update(editing.id, form) : adminApi.colors.create(form), onSuccess: () => { toast.success(editing ? "Đã cập nhật màu" : "Đã tạo màu"); setDialogOpen(false); invalidateColors(); }, onError: (mutationError) => setError(getApiErrorMessage(mutationError)) });
  const deleteMutation = useMutation({ mutationFn: (id: number) => adminApi.colors.delete(id), onSuccess: () => { toast.success("Đã xóa màu"); setDeleting(null); invalidateColors(); }, onError: (mutationError) => toast.error(getApiErrorMessage(mutationError)) });
  const openForm = (color?: ColorResponse) => { setEditing(color ?? null); setForm(color ? { name: color.name, hexCode: color.hexCode } : { name: "", hexCode: "#000000" }); setError(null); setDialogOpen(true); };
  const updateParam = (key: string, value: number) => { const next = new URLSearchParams(params); next.set(key, String(value)); if (key === "size") next.set("page", "0"); setParams(next); };
  const columns: AdminColumn<ColorResponse>[] = [{ key: "id", header: "ID", render: (color) => `#${color.id}` }, { key: "color", header: "Màu", render: (color) => <div className="flex items-center gap-3"><span className="h-9 w-9 rounded-xl border border-slate-200 shadow-inner" style={{ backgroundColor: color.hexCode }} /><div><p className="font-bold text-slate-900">{color.name}</p><code className="text-xs text-slate-400">{color.hexCode}</code></div></div> }, { key: "actions", header: "Thao tác", render: (color) => <div className="flex gap-1"><AdminButton tone="ghost" size="icon" aria-label="Sửa màu" onClick={() => openForm(color)}><Edit3 className="h-4 w-4" /></AdminButton><AdminButton tone="ghost" size="icon" aria-label="Xóa màu" className="text-rose-600 hover:bg-rose-50" onClick={() => setDeleting(color)}><Trash2 className="h-4 w-4" /></AdminButton></div> }];
  return <>
    <PageHeader title="Màu sắc" description="Danh sách màu được tải trực tiếp và phân trang từ backend." actions={<AdminButton onClick={() => openForm()}><Plus className="h-4 w-4" />Tạo màu</AdminButton>} />
    <Panel>
      <AdminTable rows={query.data?.content ?? []} columns={columns} isLoading={query.isLoading} error={query.isError ? getApiErrorMessage(query.error) : null} onRetry={() => query.refetch()} />
      <PaginationBar page={page} totalPages={query.data?.totalPages ?? 0} totalElements={query.data?.totalElements ?? 0} size={size} onPageChange={(value) => updateParam("page", value)} onSizeChange={(value) => updateParam("size", value)} />
    </Panel>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="border-slate-200 bg-white text-slate-950"><DialogHeader><DialogTitle>{editing ? "Cập nhật" : "Tạo"} màu</DialogTitle><DialogDescription className="text-slate-500">Dữ liệu được lưu trực tiếp vào catalog backend.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setError(null); if (!form.name.trim() || !/^#[0-9A-Fa-f]{6}$/.test(form.hexCode)) return setError("Tên màu và mã hex #RRGGBB là bắt buộc"); mutation.mutate(); }}>{error && <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}<div><label className="mb-1.5 block text-sm font-bold text-slate-700">Tên màu</label><input className={fieldClassName} maxLength={50} value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} /></div><div><label className="mb-1.5 block text-sm font-bold text-slate-700">Mã hex</label><div className="flex gap-3"><input className={fieldClassName} maxLength={7} value={form.hexCode} onChange={(event) => setForm((value) => ({ ...value, hexCode: event.target.value }))} /><input aria-label="Chọn màu" className="h-11 w-16 rounded-xl border border-slate-200 p-1" type="color" value={form.hexCode} onChange={(event) => setForm((value) => ({ ...value, hexCode: event.target.value }))} /></div></div><DialogFooter><AdminButton type="button" tone="secondary" onClick={() => setDialogOpen(false)}>Hủy</AdminButton><AdminButton type="submit" disabled={mutation.isPending}>{mutation.isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}Lưu màu</AdminButton></DialogFooter></form></DialogContent></Dialog>
    <ConfirmDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="Xóa màu?" description={deleting ? `Màu “${deleting.name}” có thể đang được variant tham chiếu.` : ""} confirmLabel="Xóa màu" isPending={deleteMutation.isPending} onConfirm={() => deleting && deleteMutation.mutate(deleting.id)} />
  </>;
}

const emptyNotification: NotificationRequest = { title: "", message: "", type: "SYSTEM" };

export function NotificationsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(0, Number(params.get("page") ?? 0));
  const size = Number(params.get("size") ?? 20);
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"broadcast" | "user">("broadcast");
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const [form, setForm] = useState<NotificationRequest>(emptyNotification);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<NotificationResponse | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");

  const query = useQuery({
    queryKey: adminQueryKeys.resource("notifications", { page, size }),
    queryFn: () => adminApi.notifications.list({ page, size, sort: "createdAt,desc" }),
    placeholderData: (previous) => previous,
  });

  const usersSearchQuery = useQuery({
    queryKey: adminQueryKeys.resource("users-search", { search: userSearchQuery }),
    queryFn: () => userSearchQuery.trim()
      ? adminApi.users.search(userSearchQuery.trim(), userSearchQuery.trim(), { page: 0, size: 20, sort: "id,desc" })
      : adminApi.users.list({ page: 0, size: 20, sort: "id,desc" }),
    enabled: mode === "user" && dialogOpen,
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: () => mode === "user" ? adminApi.notifications.sendToUser(selectedUser!.id, form) : adminApi.notifications.broadcast(form),
    onSuccess: (message) => {
      toast.success(message || "Đã gửi thông báo");
      setDialogOpen(false);
      setSelectedUser(null);
      setUserSearchQuery("");
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.notifications.delete(id),
    onSuccess: (message) => {
      toast.success(message || "Đã xóa thông báo");
      setDeleting(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
    onError: (mutationError) => toast.error(getApiErrorMessage(mutationError)),
  });

  const deleteAllMutation = useMutation({
    mutationFn: adminApi.notifications.deleteAll,
    onSuccess: (message) => {
      toast.success(message || "Đã xóa tất cả thông báo");
      setDeleteAllOpen(false);
      setDeletePhrase("");
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
    onError: (mutationError) => toast.error(getApiErrorMessage(mutationError)),
  });

  const updatePage = (value: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(value));
    setParams(next);
  };

  const columns: AdminColumn<NotificationResponse>[] = [
    { key: "userId", header: "ID Người dùng", render: (notification) => <code className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">#{notification.userId ?? "—"}</code> },
    { key: "userName", header: "Tên người dùng", render: (notification) => <span className="font-bold text-slate-900">{notification.userName || "—"}</span> },
    { key: "title", header: "Thông báo", render: (notification) => <div className="max-w-xl"><p className="font-extrabold text-slate-900">{notification.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{notification.message}</p></div> },
    { key: "type", header: "Loại", render: (notification) => <StatusBadge value={notification.type} /> },
    { key: "created", header: "Ngày tạo", render: (notification) => formatBackendDateTime(notification.createdAt) },
    { key: "delete", header: "", render: (notification) => <AdminButton tone="ghost" size="icon" aria-label="Xóa thông báo" className="text-rose-600 hover:bg-rose-50" onClick={() => setDeleting(notification)}><Trash2 className="h-4 w-4" /></AdminButton> },
  ];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.message.trim()) return setError("Tiêu đề và nội dung là bắt buộc");
    if (mode === "user" && (!selectedUser || selectedUser.id <= 0)) return setError("Vui lòng tìm và chọn người dùng nhận thông báo");
    mutation.mutate();
  };

  return <>
    <PageHeader title="Thông báo hệ thống" description="Gửi broadcast hoặc chọn người dùng qua thanh tìm kiếm tên, SĐT, Email để gửi riêng." actions={<><AdminButton tone="secondary" className="text-rose-600" onClick={() => setDeleteAllOpen(true)}><Trash2 className="h-4 w-4" />Xóa tất cả</AdminButton><AdminButton onClick={() => { setForm(emptyNotification); setMode("broadcast"); setSelectedUser(null); setUserSearchQuery(""); setError(null); setDialogOpen(true); }}><Send className="h-4 w-4" />Gửi thông báo</AdminButton></>} />
    <Panel>
      <AdminTable rows={query.data?.content ?? []} columns={columns} isLoading={query.isLoading} error={query.isError ? getApiErrorMessage(query.error) : null} onRetry={() => query.refetch()} />
      <PaginationBar page={page} totalPages={query.data?.totalPages ?? 0} totalElements={query.data?.totalElements ?? 0} size={size} onPageChange={updatePage} onSizeChange={(value) => { const next = new URLSearchParams(params); next.set("size", String(value)); next.set("page", "0"); setParams(next); }} />
    </Panel>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="border-slate-200 bg-white text-slate-950 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gửi thông báo</DialogTitle>
          <DialogDescription className="text-slate-500">Nội dung sẽ được gửi trực tiếp tới người dùng qua API backend.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submit}>
          {error && <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button type="button" onClick={() => setMode("broadcast")} className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === "broadcast" ? "bg-white text-indigo-700 shadow" : "text-slate-500"}`}>Broadcast toàn bộ</button>
            <button type="button" onClick={() => setMode("user")} className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === "user" ? "bg-white text-indigo-700 shadow" : "text-slate-500"}`}>Một người dùng cụ thể</button>
          </div>

          {mode === "user" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Người nhận *</label>
              {selectedUser ? (
                <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/70 p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white text-xs">
                      #{selectedUser.id}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedUser.fullName || selectedUser.username}</p>
                      <p className="text-xs text-slate-500">@{selectedUser.username} · SĐT: {selectedUser.phone || "—"} · Email: {selectedUser.email || "—"}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedUser(null)} className="text-xs font-bold text-rose-600 hover:underline">
                    Đổi người khác
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    className={fieldClassName}
                    placeholder="Tìm theo tên, số điện thoại hoặc email..."
                    value={userSearchQuery}
                    onChange={(event) => {
                      setUserSearchQuery(event.target.value);
                      setIsUserDropdownOpen(true);
                    }}
                    onFocus={() => setIsUserDropdownOpen(true)}
                  />
                  {isUserDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      {usersSearchQuery.isLoading ? (
                        <div className="p-3 text-center text-xs font-semibold text-slate-500">Đang tìm kiếm người dùng...</div>
                      ) : (usersSearchQuery.data?.content.length ?? 0) === 0 ? (
                        <div className="p-3 text-center text-xs font-semibold text-slate-500">Không tìm thấy người dùng phù hợp</div>
                      ) : (
                        usersSearchQuery.data?.content.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUserDropdownOpen(false);
                            }}
                            className="flex items-center justify-between rounded-lg p-2.5 hover:bg-indigo-50 cursor-pointer transition border-b border-slate-100 last:border-0"
                          >
                            <div>
                              <p className="text-sm font-bold text-slate-900">{user.fullName || user.username} <span className="text-xs text-slate-400">ID #{user.id}</span></p>
                              <p className="text-xs text-slate-500">@{user.username} · SĐT: {user.phone || "—"} · Email: {user.email || "—"}</p>
                            </div>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Chọn</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Tiêu đề *</label>
            <input className={fieldClassName} value={form.title} onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Nội dung *</label>
            <textarea className={textareaClassName} value={form.message} onChange={(event) => setForm((value) => ({ ...value, message: event.target.value }))} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Loại</label>
            <select className={fieldClassName} value={form.type} onChange={(event) => setForm((value) => ({ ...value, type: event.target.value as NotificationType }))}>
              {["ORDER_STATUS", "PAYMENT", "PROMOTION", "SYSTEM", "STOCK_ALERT"].map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>

          <DialogFooter>
            <AdminButton type="button" tone="secondary" onClick={() => setDialogOpen(false)}>Hủy</AdminButton>
            <AdminButton type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Gửi thông báo
            </AdminButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <ConfirmDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)} title="Xóa thông báo?" description={deleting?.title ?? ""} confirmLabel="Xóa" isPending={deleteMutation.isPending} onConfirm={() => deleting && deleteMutation.mutate(deleting.id)} />
    <ConfirmDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen} title="Xóa tất cả thông báo?" description="Đây là thao tác phá hủy và không dùng optimistic update." confirmLabel="Xóa tất cả" confirmDisabled={deletePhrase !== "XÓA TẤT CẢ"} isPending={deleteAllMutation.isPending} onConfirm={() => deleteAllMutation.mutate()}>
      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">Nhập XÓA TẤT CẢ để xác nhận</label>
        <input className={fieldClassName} value={deletePhrase} onChange={(event) => setDeletePhrase(event.target.value)} />
      </div>
    </ConfirmDialog>
  </>;
}

export function ForbiddenPage() {
  return <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6"><div className="max-w-md text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400"><ShieldAlert className="h-8 w-8" /></span><p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-rose-400">403 Forbidden</p><h1 className="mt-3 text-3xl font-black text-white">Không có quyền quản trị</h1><p className="mt-3 text-sm leading-6 text-slate-400">Tài khoản hiện tại không có role ADMIN để truy cập Ladux Admin Portal.</p><Link to="/admin/login" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-indigo-500 px-5 text-sm font-bold text-white hover:bg-indigo-400">Đăng nhập tài khoản khác</Link></div></div>;
}

export function NotFoundPage() {
  return <Panel className="mx-auto max-w-xl p-10 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><Bell className="h-6 w-6" /></span><p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">404</p><h1 className="mt-2 text-2xl font-black text-slate-950">Không tìm thấy trang quản trị</h1><p className="mt-2 text-sm text-slate-500">Đường dẫn không tồn tại trong Ladux Admin Portal.</p><Link to="/admin/dashboard" className="mt-6 inline-flex text-sm font-bold text-indigo-600">Về dashboard</Link></Panel>;
}
