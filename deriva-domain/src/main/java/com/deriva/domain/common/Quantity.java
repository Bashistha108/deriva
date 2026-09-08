package com.deriva.domain.common;

import java.math.BigDecimal;

public record Quantity(BigDecimal amount) {
    public Quantity {
        if (amount == null) {
            throw new IllegalArgumentException("Quantity amount cannot be null");
        }
    }
}
