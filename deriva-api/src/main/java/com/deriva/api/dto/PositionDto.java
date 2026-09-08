package com.deriva.api.dto;

import java.math.BigDecimal;

public record PositionDto(
        String symbol,
        BigDecimal quantity,
        BigDecimal averageEntryPrice
) {
}
