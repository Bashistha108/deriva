package com.deriva.domain.portfolio;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record CashProjection(
        String currency,
        BigDecimal balance
) {
    public CashProjection add(BigDecimal amount) {
        return new CashProjection(currency, balance.add(amount).setScale(4, RoundingMode.HALF_UP));
    }
}
