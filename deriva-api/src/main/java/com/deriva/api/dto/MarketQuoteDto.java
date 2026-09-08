package com.deriva.api.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record MarketQuoteDto(
        String symbol,
        BigDecimal bid,
        BigDecimal ask,
        BigDecimal lastPrice,
        Instant timestamp
) {
}
