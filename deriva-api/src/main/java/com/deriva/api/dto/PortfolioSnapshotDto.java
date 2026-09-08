package com.deriva.api.dto;

import com.deriva.domain.portfolio.PortfolioState;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public record PortfolioSnapshotDto(
        UUID accountId,
        BigDecimal cashBalance,
        List<PositionDto> positions,
        BigDecimal unrealizedPnl
) {
    public static PortfolioSnapshotDto fromDomain(PortfolioState state, BigDecimal unrealizedPnl) {
        List<PositionDto> positionDtos = state.positions().entrySet().stream()
                .map(entry -> new PositionDto(
                        entry.getValue().symbol(),
                        BigDecimal.valueOf(entry.getValue().quantity()),
                        entry.getValue().averageCost()
                ))
                .collect(Collectors.toList());

        return new PortfolioSnapshotDto(
                state.accountId(),
                state.cashBalances().values().stream().map(com.deriva.domain.portfolio.CashProjection::balance).reduce(BigDecimal.ZERO, BigDecimal::add),
                positionDtos,
                unrealizedPnl
        );
    }
}
