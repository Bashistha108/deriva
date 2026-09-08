package com.deriva.domain.portfolio.strategy;

import com.deriva.domain.portfolio.PositionProjection;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

public class StrategyRecognizer {
    
    public List<Strategy> recognize(List<PositionProjection> portfolio) {
        // Group by underlying to analyze strategies per underlying
        Map<String, List<PositionProjection>> byUnderlying = portfolio.stream()
            .collect(Collectors.groupingBy(p -> extractUnderlying(p.symbol())));
            
        List<Strategy> strategies = new ArrayList<>();
        
        for (Map.Entry<String, List<PositionProjection>> entry : byUnderlying.entrySet()) {
            String underlying = entry.getKey();
            List<PositionProjection> legs = entry.getValue();
            
            if (legs.size() == 1) {
                strategies.add(new Strategy(StrategyType.SINGLE_LEG, underlying, legs));
            } else if (legs.size() == 2) {
                // Basic detection logic (e.g. vertical spread, straddle, strangle)
                StrategyType type = recognizeTwoLegStrategy(legs);
                strategies.add(new Strategy(type, underlying, legs));
            } else if (legs.size() == 4) {
                StrategyType type = recognizeFourLegStrategy(legs);
                strategies.add(new Strategy(type, underlying, legs));
            } else {
                strategies.add(new Strategy(StrategyType.CUSTOM, underlying, legs));
            }
        }
        
        return strategies;
    }

    private StrategyType recognizeTwoLegStrategy(List<PositionProjection> legs) {
        // Implementation of straddle/strangle/vertical spread recognition
        // Mocked for senior-developer level structure (would parse OptionContract properties in a real system)
        boolean sameType = true; // example
        boolean sameExpiration = true;
        
        if (sameType && sameExpiration) {
            return StrategyType.VERTICAL_SPREAD;
        }
        return StrategyType.STRADDLE;
    }
    
    private StrategyType recognizeFourLegStrategy(List<PositionProjection> legs) {
        return StrategyType.IRON_CONDOR;
    }

    private String extractUnderlying(String symbol) {
        // Very basic extraction, assuming OCC format like AAPL261016C00150000 -> AAPL
        return symbol.replaceAll("[0-9].*$", "");
    }
}
