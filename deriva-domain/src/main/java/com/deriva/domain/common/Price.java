package com.deriva.domain.common;

import java.math.BigDecimal;

public record Price(BigDecimal value) {
    public Price {
        if (value == null) {
            throw new IllegalArgumentException("Price value cannot be null");
        }
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
    }
}
