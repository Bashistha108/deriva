package com.deriva.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ScenarioResponseDto(
        UUID accountId,
        BigDecimal projectedPnl,
        BigDecimal projectedMargin
) {
}
