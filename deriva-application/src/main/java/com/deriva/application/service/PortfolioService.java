package com.deriva.application.service;

import com.deriva.domain.portfolio.PortfolioState;

import java.util.UUID;

public interface PortfolioService {
    /**
     * Rebuilds the portfolio state from the ledger events.
     *
     * @param accountId the account to rebuild for
     * @return the projected portfolio state
     */
    PortfolioState getPortfolioState(UUID accountId);

    /**
     * Calculates the unrealized P/L for a given portfolio state using current market prices.
     *
     * @param state the portfolio state
     * @return the total unrealized P/L
     */
    java.math.BigDecimal calculateUnrealizedPnl(PortfolioState state);
}
