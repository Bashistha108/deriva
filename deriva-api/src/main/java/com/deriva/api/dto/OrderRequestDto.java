package com.deriva.api.dto;

import com.deriva.domain.order.OrderType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record OrderRequestDto(
        @NotNull(message = "Account ID is required")
        UUID accountId,
        @NotNull(message = "Idempotency key is required")
        String idempotencyKey,
        @NotNull(message = "Order type is required")
        OrderType type,
        @NotEmpty(message = "At least one order leg is required")
        @Valid
        List<OrderLegDto> legs
) {
}
