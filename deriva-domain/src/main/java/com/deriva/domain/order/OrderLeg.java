package com.deriva.domain.order;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderLeg(
        UUID legId,
        String symbol,
        OrderSide side,
        int quantity,
        BigDecimal limitPrice
) {
    public OrderLeg {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be strictly positive");
        }
    }
}
