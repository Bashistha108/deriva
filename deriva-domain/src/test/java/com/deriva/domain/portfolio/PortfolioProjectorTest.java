package com.deriva.domain.portfolio;

import com.deriva.domain.ledger.LedgerEventType;
import com.deriva.domain.ledger.events.CashMovementEvent;
import com.deriva.domain.ledger.events.TradeExecutionEvent;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PortfolioProjectorTest {

    @Test
    void shouldProjectCashAndPositionsCorrectly() {
        UUID accountId = UUID.randomUUID();
        PortfolioState state = PortfolioState.empty(accountId);

        // 1. Deposit $10,000
        CashMovementEvent deposit = new CashMovementEvent(UUID.randomUUID(), accountId, LedgerEventType.CASH_DEPOSIT, Instant.now(), new BigDecimal("10000"), "USD");
        state = PortfolioProjector.apply(state, deposit);

        assertEquals(new BigDecimal("10000.0000"), state.cashBalances().get("USD").balance());

        // 2. Buy 100 AAPL @ $150 = $15000 (Wait, we only have 10k, but ledger allows it for now)
        // Cash impact = -15000
        TradeExecutionEvent buy = new TradeExecutionEvent(UUID.randomUUID(), accountId, Instant.now(), new BigDecimal("-15000"), "USD", "trade-1", "AAPL", 100, new BigDecimal("150"));
        state = PortfolioProjector.apply(state, buy);

        assertEquals(new BigDecimal("-5000.0000"), state.cashBalances().get("USD").balance());
        assertEquals(100, state.positions().get("AAPL").quantity());
        assertEquals(new BigDecimal("150.0000"), state.positions().get("AAPL").averageCost());
        assertEquals(new BigDecimal("0.0000"), state.positions().get("AAPL").realizedPnl());

        // 3. Sell 50 AAPL @ $200 = $10000
        TradeExecutionEvent sell = new TradeExecutionEvent(UUID.randomUUID(), accountId, Instant.now(), new BigDecimal("10000"), "USD", "trade-2", "AAPL", -50, new BigDecimal("200"));
        state = PortfolioProjector.apply(state, sell);

        assertEquals(new BigDecimal("5000.0000"), state.cashBalances().get("USD").balance());
        assertEquals(50, state.positions().get("AAPL").quantity());
        assertEquals(new BigDecimal("150.0000"), state.positions().get("AAPL").averageCost()); // avg cost unchanged
        // Realized PnL = (200 - 150) * 50 = 2500
        assertEquals(new BigDecimal("2500.0000"), state.positions().get("AAPL").realizedPnl());
    }
}
