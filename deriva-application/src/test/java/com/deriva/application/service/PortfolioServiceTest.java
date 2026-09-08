package com.deriva.application.service;

import com.deriva.application.port.out.LedgerPort;
import com.deriva.application.port.out.MarketDataPort;
import com.deriva.application.service.impl.PortfolioServiceImpl;
import com.deriva.domain.ledger.events.LedgerEvent;
import com.deriva.domain.ledger.LedgerEventType;
import com.deriva.domain.ledger.events.TradeExecutionEvent;
import com.deriva.domain.portfolio.PortfolioState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock
    private LedgerPort ledgerPort;
    @Mock
    private MarketDataPort marketDataPort;

    private PortfolioService portfolioService;

    @BeforeEach
    void setUp() {
        portfolioService = new PortfolioServiceImpl(ledgerPort, marketDataPort);
    }

    @Test
    void shouldCalculateUnrealizedPnl() {
        UUID accountId = UUID.randomUUID();
        
        // Buy 100 AAPL at $150
        TradeExecutionEvent buy = new TradeExecutionEvent(
                UUID.randomUUID(), accountId, Instant.now(),
                new BigDecimal("-15000"), "USD", "trade-1", "AAPL", 100, new BigDecimal("150")
        );

        when(ledgerPort.getEventsByAccountId(accountId)).thenReturn(List.of(buy));
        when(marketDataPort.getLatestPrice("AAPL")).thenReturn(new BigDecimal("175"));

        PortfolioState state = portfolioService.getPortfolioState(accountId);
        BigDecimal pnl = portfolioService.calculateUnrealizedPnl(state);

        // 100 shares * ($175 - $150) = $2500
        assertEquals(new BigDecimal("2500.0000"), pnl);
    }
}
