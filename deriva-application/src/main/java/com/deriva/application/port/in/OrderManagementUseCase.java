package com.deriva.application.port.in;

import com.deriva.domain.order.Order;
import com.deriva.domain.order.OrderId;
import com.deriva.domain.order.OrderLeg;
import com.deriva.domain.order.OrderType;

import java.util.List;
import java.util.UUID;

public interface OrderManagementUseCase {
    Order submitOrder(UUID accountId, String idempotencyKey, OrderType type, List<OrderLeg> legs);
    Order cancelOrder(OrderId orderId);
    Order getOrder(OrderId orderId);
}
