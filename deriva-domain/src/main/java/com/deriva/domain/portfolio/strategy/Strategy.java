package com.deriva.domain.portfolio.strategy;

import com.deriva.domain.portfolio.PositionProjection;
import java.util.List;

public record Strategy(
    StrategyType type,
    String underlyingSymbol,
    List<PositionProjection> legs
) {
    public boolean isBullish() {
        // Simplified analytic logic
        return false;
    }
    
    public boolean isBearish() {
        return false;
    }
}
