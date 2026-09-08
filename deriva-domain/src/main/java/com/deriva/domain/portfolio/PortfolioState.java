package com.deriva.domain.portfolio;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public record PortfolioState(
        UUID accountId,
        Map<String, CashProjection> cashBalances,
        Map<String, PositionProjection> positions
) {
    public static PortfolioState empty(UUID accountId) {
        return new PortfolioState(accountId, Collections.emptyMap(), Collections.emptyMap());
    }

    public PortfolioState updateCash(CashProjection cash) {
        Map<String, CashProjection> newCash = new HashMap<>(cashBalances);
        newCash.put(cash.currency(), cash);
        return new PortfolioState(accountId, Collections.unmodifiableMap(newCash), positions);
    }

    public PortfolioState updatePosition(PositionProjection position) {
        Map<String, PositionProjection> newPositions = new HashMap<>(positions);
        newPositions.put(position.symbol(), position);
        return new PortfolioState(accountId, cashBalances, Collections.unmodifiableMap(newPositions));
    }
}
