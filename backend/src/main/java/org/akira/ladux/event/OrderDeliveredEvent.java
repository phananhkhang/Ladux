package org.akira.ladux.event;

import lombok.Getter;
import org.akira.ladux.model.Order;

@Getter
public class OrderDeliveredEvent {
    private final Order order;
    public OrderDeliveredEvent(Order order) {
        this.order = order;
    }

}
