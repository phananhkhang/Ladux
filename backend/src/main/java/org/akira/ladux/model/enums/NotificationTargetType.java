package org.akira.ladux.model.enums;

public enum NotificationTargetType {
    ORDER,      // Điều hướng tới chi tiết Đơn hàng (/orders/{targetId})
    PRODUCT,    // Điều hướng tới chi tiết Sản phẩm (/products/{targetId})
    VOUCHER,    // Điều hướng tới ví Voucher (/vouchers/{targetId})
    NONE        // Thông báo chung, click vào không chuyển trang
}
