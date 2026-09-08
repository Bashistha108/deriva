package com.deriva.domain.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record Execution(
        UUID executionId,
        OrderId orderId,
        String symbol,
        int quantity,
        BigDecimal price,
        Instant timestamp
) {}
