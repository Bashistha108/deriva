package com.deriva.infrastructure.service;

import com.deriva.application.port.out.OrderPort;
import com.deriva.domain.order.*;
import com.deriva.infrastructure.persistence.order.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class OrderPortImpl implements OrderPort {

    private final OrderRepository orderRepository;

    public OrderPortImpl(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public Order save(Order order) {
        OrderEntity entity = new OrderEntity();
        entity.setId(order.id().value());
        entity.setAccountId(order.accountId());
        entity.setIdempotencyKey(order.idempotencyKey());
        entity.setType(order.type().name());
        entity.setStatus(order.status().name());
        entity.setCreatedAt(order.createdAt());

        List<OrderLegEntity> legEntities = order.legs().stream().map(leg -> {
            OrderLegEntity legEntity = new OrderLegEntity();
            legEntity.setId(leg.legId() == null ? UUID.randomUUID() : leg.legId());
            legEntity.setOrder(entity);
            legEntity.setSymbol(leg.symbol());
            legEntity.setSide(leg.side().name());
            legEntity.setQuantity(leg.quantity());
            legEntity.setLimitPrice(leg.limitPrice());
            return legEntity;
        }).collect(Collectors.toList());
        entity.setLegs(legEntities);

        List<ExecutionEntity> execEntities = order.executions().stream().map(exec -> {
            ExecutionEntity execEntity = new ExecutionEntity();
            execEntity.setId(exec.executionId());
            execEntity.setOrder(entity);
            execEntity.setSymbol(exec.symbol());
            execEntity.setQuantity(exec.quantity());
            execEntity.setPrice(exec.price());
            execEntity.setTimestamp(exec.timestamp());
            return execEntity;
        }).collect(Collectors.toList());
        entity.setExecutions(execEntities);

        // The save method acts as an upsert (merge if ID exists)
        OrderEntity savedEntity = orderRepository.save(entity);
        return mapToDomain(savedEntity);
    }

    @Override
    public Optional<Order> findById(OrderId orderId) {
        return orderRepository.findById(orderId.value())
                .map(this::mapToDomain);
    }

    @Override
    public boolean existsByAccountIdAndIdempotencyKey(UUID accountId, String idempotencyKey) {
        return orderRepository.existsByAccountIdAndIdempotencyKey(accountId, idempotencyKey);
    }

    private Order mapToDomain(OrderEntity entity) {
        List<OrderLeg> legs = entity.getLegs().stream()
                .map(legEntity -> new OrderLeg(
                        legEntity.getId(),
                        legEntity.getSymbol(),
                        OrderSide.valueOf(legEntity.getSide()),
                        legEntity.getQuantity(),
                        legEntity.getLimitPrice()
                ))
                .collect(Collectors.toList());

        List<Execution> executions = entity.getExecutions().stream()
                .map(execEntity -> new Execution(
                        execEntity.getId(),
                        new OrderId(entity.getId()),
                        execEntity.getSymbol(),
                        execEntity.getQuantity(),
                        execEntity.getPrice(),
                        execEntity.getTimestamp()
                ))
                .collect(Collectors.toList());

        return new Order(
                new OrderId(entity.getId()),
                entity.getAccountId(),
                entity.getIdempotencyKey(),
                OrderType.valueOf(entity.getType()),
                OrderStatus.valueOf(entity.getStatus()),
                legs,
                executions,
                entity.getCreatedAt()
        );
    }
}
