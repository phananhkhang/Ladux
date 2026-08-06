package org.akira.ladux.service.impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;
import org.akira.ladux.dto.system.request.PaymentCallbackRequest;
import org.akira.ladux.dto.system.request.PaymentCreateRequest;
import org.akira.ladux.dto.order.response.OrderResponse;
import org.akira.ladux.dto.system.response.PaymentCallbackResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Order;
import org.akira.ladux.model.OrderHistory;
import org.akira.ladux.model.Payment;
import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.OrderStatus;
import org.akira.ladux.model.enums.PaymentProvider;
import org.akira.ladux.model.enums.PaymentStatus;
import org.akira.ladux.repository.OrderRepository;
import org.akira.ladux.repository.PaymentRepository;
import org.akira.ladux.service.OrderLifecycleService;
import org.akira.ladux.service.PaymentService;
import org.akira.ladux.service.VNPayPaymentUrlService;
import org.akira.ladux.utils.VNPayUtils;
import org.akira.ladux.config.VNPayProperties;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import org.springframework.web.client.RestTemplate;

// CRUD payment va dieu phoi trang thai thanh toan tu phia client/admin.
// createPayment idempotent: SUCCESS -> chan tao moi; PENDING -> tra lai payment hien tai; FAILED -> tao attempt moi.
// Khong set order.status truc tiep — luon goi OrderLifecycleService.
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository repo;
    private final OrderRepository orderRepository;
    private final OrderLifecycleService orderLifecycleService;
    private final VNPayPaymentUrlService vnPayPaymentUrlService;
    private final VNPayProperties vnPayProperties;
    private final RestTemplate restTemplate = new RestTemplate();



    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<PaymentCallbackResponse> getAllPayments(Pageable pageable) {
        return repo.findAll(pageable)
                .map(PaymentCallbackResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "'id:' + #id")
    public PaymentCallbackResponse getPaymentById(int id) {
        return PaymentCallbackResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay payment voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "'my:' + #userId + ':order:' + #orderId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<PaymentCallbackResponse> getMyPaymentsByOrderId(int userId, int orderId, Pageable pageable) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order"));

        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessRuleException("Ban khong co quyen xem thong tin thanh toan cua don hang nay");
        }

        return repo.findByOrderId(orderId, pageable)
                .map(PaymentCallbackResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "'my:' + #userId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<PaymentCallbackResponse> getMyPayments(int userId, Pageable pageable) {
        return repo.findByOrder_User_Id(userId, pageable)
                .map(PaymentCallbackResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "'my:' + #userId + ':status:' + #status + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<PaymentCallbackResponse> getMyPaymentsByStatus(int userId, PaymentStatus status, Pageable pageable) {
        return repo.findByOrder_User_IdAndStatus(userId, status, pageable)
                .map(PaymentCallbackResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "'status:' + #status + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<PaymentCallbackResponse> getPaymentsByStatus(PaymentStatus status, Pageable pageable) {
        return repo.findByStatus(status, pageable)
                .map(PaymentCallbackResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "'order:' + #orderId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<PaymentCallbackResponse> getPaymentsByOrderId(int orderId, Pageable pageable) {
        return repo.findByOrderId(orderId, pageable)
                .map(PaymentCallbackResponse::fromEntity);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "payments", allEntries = true),
            @CacheEvict(value = "orders", allEntries = true)
    })
    public PaymentCallbackResponse createPayment(int userId, PaymentCreateRequest request, String clientIp) {
        Order order = orderRepository.findByIdForUpdate(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + request.orderId()));
        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessRuleException("Ban khong co quyen tao thanh toan cho don hang nay");
        }

        ensureOrderCanAcceptPayment(order);

        Optional<Payment> lastPaymentOpt = repo.findFirstByOrderIdOrderByCreatedAtDesc(order.getId());
        if (lastPaymentOpt.isPresent()) {
            Payment lastPayment = lastPaymentOpt.get();
            // Don hang da thanh toan thanh cong -> khong tao payment moi.
            if (lastPayment.getStatus() == PaymentStatus.SUCCESS) {
                throw new BusinessRuleException("Don hang da thanh toan thanh cong, khong the tao payment moi");
            }
            // Da co payment dang cho thanh toan (duoc tao san luc tao order) -> tra ve chinh no (idempotent).
            // Neu client chon provider khac thi cap nhat lai provider cho lan thanh toan dang cho.
            if (lastPayment.getStatus() == PaymentStatus.PENDING) {
                if (request.provider() != null && request.provider() != lastPayment.getProvider()) {
                    lastPayment.setProvider(request.provider());
                }
                if (lastPayment.getProvider() == PaymentProvider.VNPAY) {
                    if (lastPayment.getMerchantTxnRef() == null || lastPayment.getMerchantTxnRef().isBlank()) {
                        lastPayment.setMerchantTxnRef(generateMerchantTxnRef(order, lastPayment));
                    }
                    String paymentUrl = vnPayPaymentUrlService.createPaymentUrl(lastPayment, clientIp);
                    lastPayment.setPaymentUrl(paymentUrl);
                    lastPayment = repo.save(lastPayment);
                }
                return PaymentCallbackResponse.fromEntity(lastPayment);
            }
            // Con lai: lastPayment FAILED -> cho phep tao attempt moi ben duoi.
        }

        PaymentProvider provider = request.provider() != null ? request.provider() : PaymentProvider.VNPAY;

        Payment payment = Payment.builder()
                .order(order)
                .provider(provider)
                .amount(order.getFinalAmount())
                .status(PaymentStatus.PENDING)
                .build();

        payment = repo.save(payment);

        if (provider == PaymentProvider.VNPAY) {
            payment.setMerchantTxnRef(generateMerchantTxnRef(order, payment));
            payment.setPaymentUrl(vnPayPaymentUrlService.createPaymentUrl(payment, clientIp));
            payment = repo.save(payment);
        }

        return PaymentCallbackResponse.fromEntity(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentCallbackResponse getMyPaymentByMerchantTxnRef(int userId, String merchantTxnRef) {
        Payment payment = repo.findByMerchantTxnRef(merchantTxnRef)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay giao dich thanh toan"));

        if (payment.getOrder() == null || !payment.getOrder().getUser().getId().equals(userId)) {
            throw new BusinessRuleException("Ban khong co quyen xem giao dich thanh toan nay");
        }

        return PaymentCallbackResponse.fromEntity(payment);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "payments", allEntries = true),
            @CacheEvict(value = "orders", allEntries = true),
            @CacheEvict(value = "orderHistories", allEntries = true)
    })
    public PaymentCallbackResponse updatePayment(int id, PaymentCallbackRequest request) {
        Payment payment = repo.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay payment voi id = " + id));

        Order order = orderRepository.findWithItemsByIdForUpdate(payment.getOrder().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order cua payment id = " + id));

        if (!order.getId().equals(request.orderId())) {
            throw new BusinessRuleException("OrderId khong khop voi payment dang cap nhat");
        }

        ensureOrderCanAcceptPayment(order);

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return PaymentCallbackResponse.fromEntity(payment);
        }

        if (request.provider() != null) {
            payment.setProvider(request.provider());
        }
        if (request.transactionNo() != null) {
            String transactionNo = request.transactionNo().trim();
            if (!transactionNo.isBlank()) {
                payment.setTransactionNo(transactionNo);
            }
        }
        if (request.status() != null) {
            if (request.status() == PaymentStatus.SUCCESS
                    && (payment.getTransactionNo() == null || payment.getTransactionNo().isBlank())) {
                payment.setTransactionNo(generateTransactionNo(payment));
            }
            payment.setStatus(request.status());
            applyPaymentStatus(order, request.status());
        }
        return PaymentCallbackResponse.fromEntity(payment);
    }

    private String generateTransactionNo(Payment payment) {
        return "PAY-" + payment.getOrder().getId() + "-" + payment.getId() + "-" + Instant.now().toEpochMilli() + UUID.randomUUID().toString().substring(0, 4);
    }

    // Kiem tra don con nhan thanh toan duoc khong. Qua han -> tu huy don (hoan kho/coupon) roi nem loi.
    private void ensureOrderCanAcceptPayment(Order order) {
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessRuleException("Don hang da bi huy, khong the cap nhat thanh toan");
        }
        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessRuleException("Don hang da duoc van chuyen, khong the cap nhat thanh toan");
        }
        if (order.getPaymentExpiresAt() != null && !order.getPaymentExpiresAt().isAfter(Instant.now())) {
            orderLifecycleService.cancelOrder(order, "Payment window expired");
            throw new BusinessRuleException("Don hang da qua han thanh toan");
        }
    }

    private void applyPaymentStatus(Order order, PaymentStatus status) {
        if (status == PaymentStatus.SUCCESS) {
            orderLifecycleService.confirmAfterSuccessfulPayment(order);
        }
        if (status == PaymentStatus.FAILED) {
            orderLifecycleService.cancelOrder(order, "Payment failed");
        }
    }
    @Transactional
    public OrderResponse processRefund(int orderId, BigDecimal refundAmount, String reason, User admin) {
        // B1: Khóa bi quan đơn hàng
        Order order = orderRepository.findWithItemsByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng id = " + orderId));
        // B2: Validation - Đơn bắt buộc phải ở trạng thái RETURNED mới được bấm hoàn tiền
        if (order.getStatus() != OrderStatus.RETURNED) {
            throw new BusinessRuleException("Đơn hàng phải ở trạng thái RETURNED (đã nhận lại hàng) mới được hoàn tiền");
        }

        // B3: Bắt lỗi chống Concurrency / Bấm hoàn tiền trùng 2 lần
        Payment payment = repo.findFirstByOrderIdAndStatusOrderByCreatedAtDesc(orderId, PaymentStatus.SUCCESS)
                .orElseThrow(() -> new BusinessRuleException("Không tìm thấy giao dịch thanh toán thành công để hoàn tiền"));

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new BusinessRuleException("Giao dịch này đã được hoàn tiền trước đó!");
        }

        // B4: Phân loại luồng Hoàn tiền (VNPay Online vs Chuyển khoản / COD Thủ công)
        boolean refundSuccess = false;
        if ("VNPAY".equalsIgnoreCase(payment.getProvider().name())) {
            refundSuccess = callVNPayRefundApi(payment, refundAmount, admin.getUsername());
        } else {
            // Hoàn tiền thủ công cho khách qua Chuyển khoản / Tiền mặt
            refundSuccess = true;
        }

        if (!refundSuccess) {
            throw new BusinessRuleException("Gọi API hoàn tiền từ Cổng thanh toán thất bại. Vui lòng kiểm tra lại!");
        }

        // B5: Đổi trạng thái Payment & Order sang REFUNDED
        payment.setStatus(PaymentStatus.REFUNDED);
        order.setStatus(OrderStatus.REFUNDED);

        order.getHistories().add(OrderHistory.builder()
                .order(order)
                .user(admin)
                .status(OrderStatus.REFUNDED)
                .description("Đã hoàn tiền " + refundAmount + " VNĐ cho khách. Lý do: " + reason)
                .build());

        repo.save(payment);
        return OrderResponse.fromEntity(orderRepository.save(order));
    }

    private boolean callVNPayRefundApi(Payment payment, BigDecimal refundAmount, String username) {
        try {
            // 1. Chuẩn bị các tham số bắt buộc theo spec VNPay
            String vnp_RequestId = String.valueOf(System.currentTimeMillis()); // Mã requestId duy nhất
            String vnp_Version = "2.1.0";
            String vnp_Command = "refund";
            String vnp_TransactionType = "02"; // 02: Hoàn tiền toàn phần, 03: Hoàn tiền một phần
            String vnp_TxnRef = payment.getTransactionNo(); // Mã giao dịch gốc của Merchant

            // Số tiền nhân 100 theo quy định VNPay (ví dụ: 100,000 VNĐ -> 10000000)
            long amountInCents = refundAmount.multiply(new BigDecimal("100")).longValue();
            String vnp_Amount = String.valueOf(amountInCents);

            String vnp_OrderInfo = "Hoan tien don hang #" + payment.getOrder().getId();
            String vnp_TransactionNo = "0"; // 0 nếu không lưu mã GD của VNPay, hoặc lấy payment.getTransactionNo()

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            String vnp_TransactionDate = payment.getCreatedAt() != null
                    ? payment.getCreatedAt().atZone(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).format(formatter)
                    : LocalDateTime.now().format(formatter);

            String vnp_CreateBy = (username != null && !username.isBlank()) ? username : "ADMIN";
            String vnp_CreateDate = LocalDateTime.now().format(formatter);
            String vnp_IpAddr = "127.0.0.1"; // IP thực hiện request

            // 2. Tạo chuỗi dữ liệu để ký Checksum (Đúng thứ tự spec VNPay yêu cầu)
            // Cú pháp: vnp_RequestId|vnp_Version|vnp_Command|vnp_TmnCode|vnp_TransactionType|vnp_TxnRef|vnp_Amount|vnp_TransactionNo|vnp_TransactionDate|vnp_CreateBy|vnp_CreateDate|vnp_IpAddr|vnp_OrderInfo
            String rawData = String.join("|",
                    vnp_RequestId,
                    vnp_Version,
                    vnp_Command,
                    vnPayProperties.getTmnCode(),
                    vnp_TransactionType,
                    vnp_TxnRef,
                    vnp_Amount,
                    vnp_TransactionNo,
                    vnp_TransactionDate,
                    vnp_CreateBy,
                    vnp_CreateDate,
                    vnp_IpAddr,
                    vnp_OrderInfo
            );

            // 3. Ký HMAC-SHA512
            String vnp_SecureHash = VNPayUtils.hmacSHA512(vnPayProperties.getHashSecret(), rawData);

            // 4. Đóng gói Body JSON gửi đi
            Map<String, String> requestParams = new HashMap<>();
            requestParams.put("vnp_RequestId", vnp_RequestId);
            requestParams.put("vnp_Version", vnp_Version);
            requestParams.put("vnp_Command", vnp_Command);
            requestParams.put("vnp_TmnCode", vnPayProperties.getTmnCode());
            requestParams.put("vnp_TransactionType", vnp_TransactionType);
            requestParams.put("vnp_TxnRef", vnp_TxnRef);
            requestParams.put("vnp_Amount", vnp_Amount);
            requestParams.put("vnp_OrderInfo", vnp_OrderInfo);
            requestParams.put("vnp_TransactionNo", vnp_TransactionNo);
            requestParams.put("vnp_TransactionDate", vnp_TransactionDate);
            requestParams.put("vnp_CreateBy", vnp_CreateBy);
            requestParams.put("vnp_CreateDate", vnp_CreateDate);
            requestParams.put("vnp_IpAddr", vnp_IpAddr);
            requestParams.put("vnp_SecureHash", vnp_SecureHash);

            // 5. Bắn HTTP POST sang VNPay
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestParams, headers);

            log.info("Sending VNPay Refund request for order #{}: {}", payment.getOrder().getId(), requestParams);

            // Gọi API
            Map<String, Object> response = restTemplate.postForObject(vnPayProperties.getRefundUrl(), entity, Map.class);

            // 6. Kiểm tra mã phản hồi (vnp_ResponseCode = "00" là thành công)
            if (response != null) {
                String responseCode = (String) response.get("vnp_ResponseCode");
                String message = (String) response.get("vnp_Message");
                log.info("VNPay Refund response code: {}, message: {}", responseCode, message);

                return "00".equals(responseCode);
            }

        } catch (Exception ex) {
            log.error("Loi khi goi API Hoan tien VNPay cho payment id = {}", payment.getId(), ex);
        }
        return false;
    }

    private String generateMerchantTxnRef(Order order, Payment payment) {
        return "LDX"
                + order.getId()
                + payment.getId()
                + System.currentTimeMillis();
    }
}
