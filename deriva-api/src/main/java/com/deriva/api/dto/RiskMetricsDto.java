package com.deriva.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RiskMetricsDto(
        UUID accountId,
        BigDecimal valueAtRisk,
        BigDecimal totalDelta,
        BigDecimal totalGamma,
        BigDecimal totalTheta,
        BigDecimal totalVega,
        BigDecimal marginUsage
) {
}
