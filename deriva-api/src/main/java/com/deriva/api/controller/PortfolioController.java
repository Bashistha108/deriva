package com.deriva.api.controller;

import com.deriva.api.dto.PortfolioSnapshotDto;
import com.deriva.application.service.PortfolioService;
import com.deriva.domain.portfolio.PortfolioState;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio")
@Tag(name = "Portfolio", description = "Endpoints for viewing portfolio state and valuation")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/{accountId}")
    @Operation(summary = "Get portfolio state", description = "Retrieves the current portfolio state, positions, and unrealized P/L for an account.")
    public ResponseEntity<PortfolioSnapshotDto> getPortfolio(@PathVariable UUID accountId) {
        PortfolioState state = portfolioService.getPortfolioState(accountId);
        BigDecimal unrealizedPnl = portfolioService.calculateUnrealizedPnl(state);
        return ResponseEntity.ok(PortfolioSnapshotDto.fromDomain(state, unrealizedPnl));
    }
}
