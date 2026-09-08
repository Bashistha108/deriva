package com.deriva.domain.portfolio;

import com.deriva.domain.ledger.events.LedgerEvent;
import com.deriva.domain.ledger.events.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class PortfolioProjector {

    /**
     * Applies a ledger event to the current portfolio state to produce the next state.
     * Uses functional reducer semantics (immutable state transitions).
     *
     * @param state The current portfolio state
     * @param event The ledger event to apply
     * @return The new portfolio state
     */
    public static PortfolioState apply(PortfolioState state, LedgerEvent event) {
        PortfolioState nextState = state;

        if (event instanceof CashMovementEvent cashEvent) {
            CashProjection currentCash = state.cashBalances().getOrDefault(cashEvent.currency(), new CashProjection(cashEvent.currency(), BigDecimal.ZERO));
            if (cashEvent.eventType().name().equals("CASH_DEPOSIT")) {
                nextState = nextState.updateCash(currentCash.add(cashEvent.amount()));
            } else {
                nextState = nextState.updateCash(currentCash.add(cashEvent.amount().negate()));
            }
        } else if (event instanceof TradeExecutionEvent tradeEvent) {
            // Update cash
            CashProjection currentCash = state.cashBalances().getOrDefault(tradeEvent.currency(), new CashProjection(tradeEvent.currency(), BigDecimal.ZERO));
            nextState = nextState.updateCash(currentCash.add(tradeEvent.amount())); // trade amount is cash impact (usually negative for buy)

            // Update position
            PositionProjection currentPosition = state.positions().getOrDefault(tradeEvent.assetSymbol(), PositionProjection.empty(tradeEvent.assetSymbol()));
            PositionProjection newPosition = currentPosition.addTrade(tradeEvent.quantity(), tradeEvent.price());
            nextState = nextState.updatePosition(newPosition);
        } else if (event instanceof FeeEvent feeEvent) {
            CashProjection currentCash = state.cashBalances().getOrDefault(feeEvent.currency(), new CashProjection(feeEvent.currency(), BigDecimal.ZERO));
            nextState = nextState.updateCash(currentCash.add(feeEvent.amount())); // usually debit (negative amount)
        } else if (event instanceof DividendEvent dividendEvent) {
            CashProjection currentCash = state.cashBalances().getOrDefault(dividendEvent.currency(), new CashProjection(dividendEvent.currency(), BigDecimal.ZERO));
            nextState = nextState.updateCash(currentCash.add(dividendEvent.amount())); // usually credit
        } else if (event instanceof InterestEvent interestEvent) {
            CashProjection currentCash = state.cashBalances().getOrDefault(interestEvent.currency(), new CashProjection(interestEvent.currency(), BigDecimal.ZERO));
            nextState = nextState.updateCash(currentCash.add(interestEvent.amount())); // credit or debit
        } else if (event instanceof OptionLifecycleEvent optionEvent) {
            CashProjection currentCash = state.cashBalances().getOrDefault(optionEvent.currency(), new CashProjection(optionEvent.currency(), BigDecimal.ZERO));
            nextState = nextState.updateCash(currentCash.add(optionEvent.amount()));
            // Further logic for handling option lifecycle could be added here (e.g. adding underlying stock position on assignment)
        }

        return nextState;
    }
}
