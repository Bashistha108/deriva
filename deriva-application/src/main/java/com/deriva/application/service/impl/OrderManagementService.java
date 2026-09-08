package com.deriva.application.service.impl;

import com.deriva.application.port.in.OrderManagementUseCase;
import com.deriva.application.port.out.OrderPort;
import com.deriva.domain.order.Order;
import com.deriva.domain.order.OrderId;
import com.deriva.domain.order.OrderLeg;
import com.deriva.domain.order.OrderType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class OrderManagementService implements OrderManagementUseCase {

    private final OrderPort orderPort;
    private final ExecutionSimulator executionSimulator;

    public OrderManagementService(OrderPort orderPort, ExecutionSimulator executionSimulator) {
        this.orderPort = orderPort;
        this.executionSimulator = executionSimulator;
    }

    @Override
    public Order submitOrder(UUID accountId, String idempotencyKey, OrderType type, List<OrderLeg> legs) {
        // Idempotency check
        if (orderPort.existsByAccountIdAndIdempotencyKey(accountId, idempotencyKey)) {
            throw new IllegalStateException("Order with idempotency key already exists: " + idempotencyKey);
        }

        // Validation happens in domain constructor (at least 1 leg, quantity > 0)
        Order newOrder = Order.create(accountId, idempotencyKey, type, legs);
        
        // Open the order
        Order openedOrder = newOrder.open();
        
        // Persist before execution simulation
        Order savedOrder = orderPort.save(openedOrder);

        // Simulate execution (this would normally be asynchronous or handled via messaging)
        Order finalOrder = executionSimulator.simulateExecution(savedOrder);

        // Save again if state changed
        if (finalOrder.status() != savedOrder.status()) {
            return orderPort.save(finalOrder);
        }

        return savedOrder;
    }

    @Override
    public Order cancelOrder(OrderId orderId) {
        Order order = getOrder(orderId);
        Order cancelledOrder = order.cancel();
        return orderPort.save(cancelledOrder);
    }

    @Override
    public Order getOrder(OrderId orderId) {
        return orderPort.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId.value()));
    }
}
