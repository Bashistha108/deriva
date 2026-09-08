package com.deriva.application.service.impl;

import com.deriva.application.port.out.LedgerPort;
import com.deriva.application.port.out.MarketDataPort;
import com.deriva.domain.ledger.events.TradeExecutionEvent;
import com.deriva.domain.order.Execution;
import com.deriva.domain.order.Order;
import com.deriva.domain.order.OrderLeg;
import com.deriva.domain.order.OrderType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ExecutionSimulator {

    private final MarketDataPort marketDataPort;
    private final LedgerPort ledgerPort;

    public ExecutionSimulator(MarketDataPort marketDataPort, LedgerPort ledgerPort) {
        this.marketDataPort = marketDataPort;
        this.ledgerPort = ledgerPort;
    }

    public Order simulateExecution(Order order) {
        if (order.type() == OrderType.MARKET) {
            return executeMarketOrder(order);
        } else if (order.type() == OrderType.LIMIT) {
            return executeLimitOrder(order);
        }
        // Stop orders not simulated for now
        return order;
    }

    private Order executeMarketOrder(Order order) {
        List<Execution> executions = new ArrayList<>();
        
        for (OrderLeg leg : order.legs()) {
            // Fetch market price. For a real system we look at bid/ask depending on OrderSide.
            // Here we just get the current simulated price.
            BigDecimal currentPrice = marketDataPort.getLatestPrice(leg.symbol());
            if (currentPrice == null) {
                currentPrice = BigDecimal.valueOf(100.0); // Fallback dummy price if no quote
            }
            
            Execution execution = new Execution(
                    UUID.randomUUID(),
                    order.id(),
                    leg.symbol(),
                    leg.quantity(),
                    currentPrice,
                    Instant.now()
            );
            executions.add(execution);
            
            // Generate Ledger Event
            TradeExecutionEvent tradeEvent = new TradeExecutionEvent(
                    UUID.randomUUID(),
                    order.accountId(),
                    Instant.now(),
                    currentPrice.multiply(BigDecimal.valueOf(leg.quantity())),
                    "USD",
                    execution.executionId().toString(),
                    leg.symbol(),
                    leg.side().name().equals("BUY") ? leg.quantity() : -leg.quantity(),
                    currentPrice
            );
            ledgerPort.append(tradeEvent);
        }

        return order.fill(executions);
    }

    private Order executeLimitOrder(Order order) {
        // For simulation, we check if the limit price is strictly met by the market.
        // If not, we don't fill it.
        List<Execution> executions = new ArrayList<>();

        for (OrderLeg leg : order.legs()) {
            BigDecimal limitPrice = leg.limitPrice();
            if (limitPrice == null) {
                // Should be validated earlier, but safeguard
                return order;
            }
            
            BigDecimal currentPrice = marketDataPort.getLatestPrice(leg.symbol());
            if (currentPrice == null) {
                currentPrice = BigDecimal.valueOf(100.0);
            }
            
            boolean isFillable =
                    (leg.side().name().equals("BUY") && currentPrice.compareTo(limitPrice) <= 0) ||
                    (leg.side().name().equals("SELL") && currentPrice.compareTo(limitPrice) >= 0);

            if (isFillable) {
                Execution execution = new Execution(
                        UUID.randomUUID(),
                        order.id(),
                        leg.symbol(),
                        leg.quantity(),
                        currentPrice, // Fills at current market price which is better or equal to limit
                        Instant.now()
                );
                executions.add(execution);

                TradeExecutionEvent tradeEvent = new TradeExecutionEvent(
                        UUID.randomUUID(),
                        order.accountId(),
                        Instant.now(),
                        currentPrice.multiply(BigDecimal.valueOf(leg.quantity())),
                        "USD",
                        execution.executionId().toString(),
                        leg.symbol(),
                        leg.side().name().equals("BUY") ? leg.quantity() : -leg.quantity(),
                        currentPrice
                );
                ledgerPort.append(tradeEvent);
            } else {
                // If one leg is not fillable, the entire multi-leg limit order doesn't fill (Atomic)
                return order;
            }
        }
        
        return order.fill(executions);
    }
}
