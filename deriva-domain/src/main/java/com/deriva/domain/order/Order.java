package com.deriva.domain.order;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public record Order(
        OrderId id,
        UUID accountId,
        String idempotencyKey,
        OrderType type,
        OrderStatus status,
        List<OrderLeg> legs,
        List<Execution> executions,
        Instant createdAt
) {
    public Order {
        if (legs == null || legs.isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one leg");
        }
        legs = List.copyOf(legs);
        executions = executions == null ? Collections.emptyList() : List.copyOf(executions);
    }

    public static Order create(UUID accountId, String idempotencyKey, OrderType type, List<OrderLeg> legs) {
        return new Order(
                OrderId.generate(),
                accountId,
                idempotencyKey,
                type,
                OrderStatus.PENDING,
                legs,
                Collections.emptyList(),
                Instant.now()
        );
    }

    public Order open() {
        if (status != OrderStatus.PENDING) {
            throw new IllegalStateException("Only PENDING orders can be opened");
        }
        return new Order(id, accountId, idempotencyKey, type, OrderStatus.OPEN, legs, executions, createdAt);
    }

    public Order cancel() {
        if (status == OrderStatus.FILLED || status == OrderStatus.CANCELLED || status == OrderStatus.REJECTED) {
            throw new IllegalStateException("Cannot cancel order in status: " + status);
        }
        return new Order(id, accountId, idempotencyKey, type, OrderStatus.CANCELLED, legs, executions, createdAt);
    }

    public Order reject() {
        if (status != OrderStatus.PENDING && status != OrderStatus.OPEN) {
            throw new IllegalStateException("Cannot reject order in status: " + status);
        }
        return new Order(id, accountId, idempotencyKey, type, OrderStatus.REJECTED, legs, executions, createdAt);
    }

    public Order fill(List<Execution> newExecutions) {
        if (status != OrderStatus.OPEN && status != OrderStatus.PARTIALLY_FILLED) {
            throw new IllegalStateException("Cannot fill order in status: " + status);
        }

        List<Execution> updatedExecutions = Stream.concat(executions.stream(), newExecutions.stream())
                .collect(Collectors.toList());

        boolean fullyFilled = true;
        
        OrderStatus newStatus = fullyFilled ? OrderStatus.FILLED : OrderStatus.PARTIALLY_FILLED;

        return new Order(id, accountId, idempotencyKey, type, newStatus, legs, updatedExecutions, createdAt);
    }
}
