package com.deriva.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TradeDto(
        UUID executionId,
        UUID orderId,
        String symbol,
        BigDecimal quantity,
        BigDecimal price,
        Instant timestamp
) {
}
