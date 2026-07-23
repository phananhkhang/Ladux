package org.akira.ladux.model.enums;

public enum NotificationType {
    ORDER_STATUS,  // Cập nhật trạng thái đơn hàng
    PAYMENT,       // Thanh toán thành công / thất bại
    PROMOTION,     // Khuyến mãi / Voucher mới
    SYSTEM,        // Thông báo hệ thống
    STOCK_ALERT    // Cảnh báo kho (Dành cho Admin khi sắp hết hàng)
}
