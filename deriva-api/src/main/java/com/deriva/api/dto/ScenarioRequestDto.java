package com.deriva.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ScenarioRequestDto(
        UUID accountId,
        BigDecimal underlyingPriceShiftPercent,
        BigDecimal volatilityShiftPercent,
        int daysForward
) {
}
