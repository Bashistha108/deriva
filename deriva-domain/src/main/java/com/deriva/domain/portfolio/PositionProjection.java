package com.deriva.domain.portfolio;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record PositionProjection(
        String symbol,
        int quantity,
        BigDecimal averageCost,
        BigDecimal realizedPnl
) {
    public static PositionProjection empty(String symbol) {
        return new PositionProjection(symbol, 0, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    public PositionProjection addTrade(int tradeQuantity, BigDecimal tradePrice) {
        int newQuantity = quantity + tradeQuantity;
        BigDecimal newAverageCost = averageCost;
        BigDecimal additionalRealizedPnl = BigDecimal.ZERO;

        if (newQuantity == 0) {
            // Position closed
            additionalRealizedPnl = calculatePnl(tradeQuantity, tradePrice);
            newAverageCost = BigDecimal.ZERO;
        } else if (quantity == 0 || Math.signum(quantity) == Math.signum(tradeQuantity)) {
            // Adding to existing position
            BigDecimal currentTotalCost = averageCost.multiply(BigDecimal.valueOf(Math.abs(quantity)));
            BigDecimal tradeTotalCost = tradePrice.multiply(BigDecimal.valueOf(Math.abs(tradeQuantity)));
            newAverageCost = currentTotalCost.add(tradeTotalCost)
                    .divide(BigDecimal.valueOf(Math.abs(newQuantity)), 4, RoundingMode.HALF_UP);
        } else {
            // Reducing or reversing position
            if (Math.signum(quantity) == Math.signum(newQuantity)) {
                // Reducing, not reversing
                additionalRealizedPnl = calculatePnl(tradeQuantity, tradePrice);
                newAverageCost = averageCost; // Cost basis remains unchanged
            } else {
                // Reversing position (e.g. was long 10, sold 15 -> short 5)
                int closedQuantity = -quantity;
                additionalRealizedPnl = calculatePnl(closedQuantity, tradePrice);
                newAverageCost = tradePrice;
            }
        }

        return new PositionProjection(
                symbol,
                newQuantity,
                newAverageCost,
                realizedPnl.add(additionalRealizedPnl).setScale(4, RoundingMode.HALF_UP)
        );
    }

    private BigDecimal calculatePnl(int closedQuantity, BigDecimal closePrice) {
        // If we are long (quantity > 0) and sell (closedQuantity < 0)
        // PnL = (closePrice - avgCost) * abs(closedQuantity)
        // If we are short (quantity < 0) and buy (closedQuantity > 0)
        // PnL = (avgCost - closePrice) * abs(closedQuantity)
        
        BigDecimal qty = BigDecimal.valueOf(Math.abs(closedQuantity));
        if (quantity > 0) { // closing a long
            return closePrice.subtract(averageCost).multiply(qty);
        } else { // closing a short
            return averageCost.subtract(closePrice).multiply(qty);
        }
    }
}
