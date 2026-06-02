package org.akira.auratech.controller;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PaymentService paymentService;

    @GetMapping("/vnpay-webhook")
    public ResponseEntity<String> handleVNPayWebhook(@RequestParam Map<String, String> params) {
        // 🎯 Nhặt mã chữ ký bảo mật do VNPAY gửi sang
        String vnp_SecureHash = params.get("vnp_SecureHash");

        // Gọi service xử lý thẩm định và duyệt tiền tự động
        boolean isValid = paymentService.verifyAndProcessWebhook(params, vnp_SecureHash);

        if (isValid) {
            // Phản hồi đúng chuẩn format JSON của VNPAY để họ ngừng bắn nhắc nhở
            return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
        }
        return ResponseEntity.badRequest().body("{\"RspCode\":\"97\",\"Message\":\"Invalid Checksum\"}");
    }
}