package com.deriva.application.service.impl;

import com.deriva.application.port.out.LedgerPort;
import com.deriva.application.port.out.MarketDataPort;
import com.deriva.application.service.PortfolioService;
import com.deriva.domain.ledger.events.LedgerEvent;
import com.deriva.domain.portfolio.PortfolioProjector;
import com.deriva.domain.portfolio.PortfolioState;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class PortfolioServiceImpl implements PortfolioService {

    private final LedgerPort ledgerPort;
    private final MarketDataPort marketDataPort;

    public PortfolioServiceImpl(LedgerPort ledgerPort, MarketDataPort marketDataPort) {
        this.ledgerPort = ledgerPort;
        this.marketDataPort = marketDataPort;
    }

    @Override
    public PortfolioState getPortfolioState(UUID accountId) {
        List<LedgerEvent> events = ledgerPort.getEventsByAccountId(accountId);
        PortfolioState state = PortfolioState.empty(accountId);
        for (LedgerEvent event : events) {
            state = PortfolioProjector.apply(state, event);
        }
        return state;
    }

    @Override
    public BigDecimal calculateUnrealizedPnl(PortfolioState state) {
        BigDecimal totalUnrealizedPnl = BigDecimal.ZERO;
        for (var position : state.positions().values()) {
            if (position.quantity() == 0) continue;
            BigDecimal currentPrice = marketDataPort.getLatestPrice(position.symbol());
            BigDecimal currentMarketValue = currentPrice.multiply(BigDecimal.valueOf(Math.abs(position.quantity())));
            BigDecimal totalCostBasis = position.averageCost().multiply(BigDecimal.valueOf(Math.abs(position.quantity())));

            BigDecimal pnl;
            if (position.quantity() > 0) {
                pnl = currentMarketValue.subtract(totalCostBasis);
            } else {
                pnl = totalCostBasis.subtract(currentMarketValue);
            }
            totalUnrealizedPnl = totalUnrealizedPnl.add(pnl);
        }
        return totalUnrealizedPnl.setScale(4, RoundingMode.HALF_UP);
    }
}
