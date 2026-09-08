package com.deriva.api.dto;

import com.deriva.domain.order.OrderSide;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record OrderLegDto(
        @NotNull(message = "Instrument symbol is required")
        String symbol,
        @NotNull(message = "Order side is required")
        OrderSide side,
        @NotNull(message = "Quantity is required")
        @DecimalMin(value = "1", message = "Quantity must be positive")
        BigDecimal quantity
) {
}
