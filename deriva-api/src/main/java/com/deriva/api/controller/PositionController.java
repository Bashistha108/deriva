package com.deriva.api.controller;

import com.deriva.api.dto.PositionDto;
import com.deriva.application.service.PortfolioService;
import com.deriva.domain.portfolio.PortfolioState;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/positions")
@Tag(name = "Positions", description = "Endpoints for viewing individual positions")
public class PositionController {

    private final PortfolioService portfolioService;

    public PositionController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/{accountId}")
    @Operation(summary = "Get account positions", description = "Retrieves all current positions for an account.")
    public ResponseEntity<List<PositionDto>> getPositions(@PathVariable UUID accountId) {
        PortfolioState state = portfolioService.getPortfolioState(accountId);
        List<PositionDto> positions = state.positions().entrySet().stream()
                .map(entry -> new PositionDto(
                        entry.getValue().symbol(),
                        java.math.BigDecimal.valueOf(entry.getValue().quantity()),
                        entry.getValue().averageCost()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(positions);
    }
}
