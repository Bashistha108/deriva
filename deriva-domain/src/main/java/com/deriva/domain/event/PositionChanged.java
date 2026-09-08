package com.deriva.domain.event;
import java.time.Instant;
import java.util.UUID;
import java.math.BigDecimal;
public record PositionChanged(UUID eventId, Instant timestamp, UUID accountId, String symbol, int quantityChange, BigDecimal averagePrice) implements DomainEvent {
    public PositionChanged {
        if (eventId == null) eventId = UUID.randomUUID();
        if (timestamp == null) timestamp = Instant.now();
    }
}
