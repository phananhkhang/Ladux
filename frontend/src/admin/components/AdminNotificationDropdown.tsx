import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, RotateCcw, Check, ExternalLink, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../api/adminApi";
import { formatBackendDateTime } from "../utils";
import type { NotificationResponse } from "../types";

export function AdminNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin", "notifications", "header"],
    queryFn: () => adminApi.notifications.list({ page: 0, size: 15, sort: "createdAt,desc" }),
    refetchInterval: 10000, // Tự động làm mới mỗi 10 giây để cập nhật yêu cầu trả hàng
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => adminApi.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const notifications = data?.content ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Kiểm tra xem thông báo có phải là yêu cầu trả hàng không
  const isReturnRequest = (item: NotificationResponse) => {
    const text = `${item.title} ${item.message}`.toLowerCase();
    return text.includes("trả hàng") || text.includes("return");
  };

  // Trích xuất Order ID từ tiêu đề hoặc nội dung thông báo
  const extractOrderId = (item: NotificationResponse): number | null => {
    const match = item.title.match(/#(\d+)/) || item.message.match(/#(\d+)/);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
    }
    return null;
  };

  const handleItemClick = (item: NotificationResponse) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }

    const orderId = extractOrderId(item);
    if (orderId) {
      setIsOpen(false);
      navigate(`/admin/orders/${orderId}?review=true`);
    } else {
      setIsOpen(false);
      navigate("/admin/notifications");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Thông báo"
        title="Thông báo hệ thống"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 active:scale-95 focus:outline-none"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900">Thông báo</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/admin/notifications");
              }}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Xem tất cả <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 py-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                <Inbox className="h-8 w-8 stroke-1" />
                <p className="mt-2 text-xs font-medium">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((item) => {
                const isReturn = isReturnRequest(item);
                const orderId = extractOrderId(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`group relative flex cursor-pointer gap-3 rounded-xl p-3 transition-colors ${
                      item.isRead
                        ? "bg-transparent hover:bg-slate-50 opacity-80"
                        : "bg-indigo-50/40 hover:bg-indigo-50/80 font-medium"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isReturn ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-sm">
                          <RotateCcw className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-sm">
                          <Bell className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`truncate text-xs font-bold ${isReturn ? "text-amber-800" : "text-slate-900"}`}>
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{formatBackendDateTime(item.createdAt)}</span>
                        {orderId && (
                          <span className="font-mono font-bold text-indigo-600 group-hover:underline">
                            Đơn #{orderId} →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
