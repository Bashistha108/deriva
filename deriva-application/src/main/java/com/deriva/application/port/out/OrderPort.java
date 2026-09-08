package com.deriva.application.port.out;

import com.deriva.domain.order.Order;
import com.deriva.domain.order.OrderId;

import java.util.Optional;
import java.util.UUID;

public interface OrderPort {
    Order save(Order order);
    Optional<Order> findById(OrderId orderId);
    boolean existsByAccountIdAndIdempotencyKey(UUID accountId, String idempotencyKey);
}
