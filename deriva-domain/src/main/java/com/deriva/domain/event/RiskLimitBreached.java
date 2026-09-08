package com.deriva.domain.event;
import java.time.Instant;
import java.util.UUID;
import java.math.BigDecimal;
public record RiskLimitBreached(UUID eventId, Instant timestamp, UUID accountId, String limitType, BigDecimal limitValue, BigDecimal actualValue) implements DomainEvent {
    public RiskLimitBreached {
        if (eventId == null) eventId = UUID.randomUUID();
        if (timestamp == null) timestamp = Instant.now();
    }
}
