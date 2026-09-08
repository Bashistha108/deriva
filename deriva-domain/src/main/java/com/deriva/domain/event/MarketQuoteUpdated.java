package com.deriva.domain.event;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
public record MarketQuoteUpdated(UUID eventId, Instant timestamp, String symbol, BigDecimal bid, BigDecimal ask, BigDecimal lastPrice) implements DomainEvent {
    public MarketQuoteUpdated {
        if (eventId == null) eventId = UUID.randomUUID();
        if (timestamp == null) timestamp = Instant.now();
    }
}
