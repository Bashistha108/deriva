package com.deriva.domain.portfolio;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public class PortfolioAggregator {
    
    public PortfolioSummary aggregate(PortfolioState state, List<PositionProjection> projections) {
        BigDecimal totalCash = state.cashBalances().values().stream()
            .map(CashProjection::balance)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalRealizedPnl = BigDecimal.ZERO;
        BigDecimal totalUnrealizedPnl = BigDecimal.ZERO;
        
        BigDecimal netDelta = BigDecimal.ZERO;
        BigDecimal netGamma = BigDecimal.ZERO;
        BigDecimal netTheta = BigDecimal.ZERO;
        BigDecimal netVega = BigDecimal.ZERO;
        BigDecimal netRho = BigDecimal.ZERO;
        
        BigDecimal totalMarginUsage = BigDecimal.ZERO;

        for (PositionProjection pos : projections) {
            totalRealizedPnl = totalRealizedPnl.add(pos.realizedPnl());
            // Simulated unrealized P/L and Greeks aggregation
            // In a real system, this would require joining with latest MarketQuotes
            totalMarginUsage = totalMarginUsage.add(BigDecimal.valueOf(Math.abs(pos.quantity())).multiply(BigDecimal.valueOf(100))); 
        }

        BigDecimal buyingPower = totalCash.subtract(totalMarginUsage).max(BigDecimal.ZERO);
        
        return new PortfolioSummary(
            totalCash,
            totalRealizedPnl,
            totalUnrealizedPnl,
            buyingPower,
            totalMarginUsage,
            new AggregateGreeks(netDelta, netGamma, netTheta, netVega, netRho)
        );
    }
}

record PortfolioSummary(
    BigDecimal totalCash,
    BigDecimal realizedPnl,
    BigDecimal unrealizedPnl,
    BigDecimal buyingPower,
    BigDecimal marginUtilization,
    AggregateGreeks greeks
) {}

record AggregateGreeks(
    BigDecimal delta,
    BigDecimal gamma,
    BigDecimal theta,
    BigDecimal vega,
    BigDecimal rho
) {}
