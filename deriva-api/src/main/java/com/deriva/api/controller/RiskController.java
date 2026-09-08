package com.deriva.api.controller;

import com.deriva.api.dto.RiskMetricsDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/risk")
@Tag(name = "Risk", description = "Endpoints for viewing portfolio risk metrics")
public class RiskController {

    @GetMapping("/{accountId}")
    @Operation(summary = "Get portfolio risk metrics", description = "Retrieves risk metrics such as VaR and portfolio Greeks.")
    public ResponseEntity<RiskMetricsDto> getRiskMetrics(@PathVariable UUID accountId) {
        // Mocked for now, as full Risk Engine is typically Phase S or similar
        RiskMetricsDto metrics = new RiskMetricsDto(
                accountId,
                new BigDecimal("15000.00"),
                new BigDecimal("12.5"),
                new BigDecimal("-0.4"),
                new BigDecimal("-250.00"),
                new BigDecimal("1200.00"),
                new BigDecimal("0.45")
        );
        return ResponseEntity.ok(metrics);
    }
}
