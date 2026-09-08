package com.deriva.api.dto;

import com.deriva.domain.order.Order;
import com.deriva.domain.order.OrderStatus;
import com.deriva.domain.order.OrderType;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public record OrderResponseDto(
        UUID orderId,
        UUID accountId,
        OrderStatus status,
        OrderType type,
        List<OrderLegDto> legs
) {
    public static OrderResponseDto fromDomain(Order order) {
        List<OrderLegDto> legDtos = order.legs().stream()
                .map(leg -> new OrderLegDto(leg.symbol(), leg.side(), java.math.BigDecimal.valueOf(leg.quantity())))
                .collect(Collectors.toList());

        return new OrderResponseDto(
                order.id().value(),
                order.accountId(),
                order.status(),
                order.type(),
                legDtos
        );
    }
}
