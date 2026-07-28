package org.akira.ladux.event.listener;

import org.akira.ladux.event.OrderDeliveredEvent;
import org.akira.ladux.model.Order;
import org.akira.ladux.repository.CustomerRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoyaltyEventListener {

    private final CustomerRepository customerRepository;

    @EventListener
    @Transactional
    // Tổng tiền chi tiêu và điểm thưởng sau khi được tích lũy
    public void handleOrderDelivered(OrderDeliveredEvent event) {
        Order order = event.getOrder();
        if (order.getUser() == null) return;

        customerRepository.findByUserId(order.getUser().getId()).ifPresent(customer -> {
            // 1. Tích lũy tổng số tiền đã chi tiêu (totalSpent)
            BigDecimal currentSpent = customer.getTotalSpent() != null ? customer.getTotalSpent() : BigDecimal.ZERO;
            BigDecimal newTotalSpent = currentSpent.add(order.getFinalAmount());
            customer.setTotalSpent(newTotalSpent);

            // 2. Quy đổi điểm thưởng (Ví dụ: 10,000 VNĐ = 1 điểm loyalty)
            Long pointsEarned = order.getFinalAmount().divideToIntegralValue(new BigDecimal("10000")).longValue();
            Long currentPoints = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;
            customer.setLoyaltyPoints(currentPoints + pointsEarned);

            customerRepository.save(customer);
        });
    }
}