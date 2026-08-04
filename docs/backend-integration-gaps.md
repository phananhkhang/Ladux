# Ladux Admin Portal — Backend integration gaps

Admin Portal chỉ gọi các endpoint đã tồn tại. Những khoảng trống dưới đây được hiển thị rõ trong UI thay vì dùng mock data hoặc tự suy đoán API.

1. Chưa có GET danh sách colors.
2. Route color là `/api/v1/admin/color` (số ít), không phải `/colors`.
3. Chưa có API tạo admin user dù DTO create tồn tại.
4. Chưa có API catalog roles hoặc role IDs.
5. Chưa có admin GET riêng cho products, brands, categories; portal dùng public GET.
6. Chưa có GET toàn bộ product variants; portal lấy variant từ `ProductResponse.variants`.
7. Chưa có API xóa/moderate review.
8. Chưa có API sửa/xóa user address cho admin.
9. `processReturnOrder` tồn tại ở service nhưng chưa được expose bởi controller.
10. `processRefund` tồn tại ở service nhưng chưa được expose bởi controller.
11. PATCH order status sang `RETURNED` có nguy cơ không chạy luồng hoàn kho chuyên biệt.
12. PATCH order status sang `REFUNDED` không thay thế refund gateway.
13. `PurchaseOrderApproveRequest` tồn tại nhưng chưa thấy endpoint sử dụng.
14. `expectedDeliveryDate` có trong response nhưng create/update hiện chưa có luồng nhập rõ ràng.
15. `StockMovementRequest.productId` thực tế nhận ProductVariant ID.
16. Dashboard chưa có analytics API; portal chỉ dùng `totalElements` từ các endpoint phân trang.
17. Notification create/delete trả plain text.
18. Một số mutation thiếu `@Valid`; frontend vẫn validate và xử lý lỗi server.
19. Color service ném `IllegalArgumentException`, có khả năng được trả thành HTTP 500.
20. Admin payment update chỉ có hiệu lực với payment `PENDING`.
21. Chưa có GET admin order theo ID; trang chi tiết tải item/history/payment thật và chỉ có summary khi điều hướng từ danh sách.
22. Chưa có API search đơn hàng.

Hai transition order `RETURNED` và `REFUNDED` bị khóa mặc định. Chỉ bật cho mục đích kiểm thử bằng `VITE_ENABLE_UNSAFE_ORDER_RETURN_TRANSITIONS=true`.
