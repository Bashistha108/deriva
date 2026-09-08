package com.deriva.domain.ledger.events;

import com.deriva.domain.ledger.LedgerEventType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OptionLifecycleEvent(
        UUID eventId,
        UUID accountId,
        LedgerEventType eventType,
        Instant timestamp,
        BigDecimal amount,
        String currency,
        String contractSymbol
) implements LedgerEvent {
    public OptionLifecycleEvent {
        if (eventType != LedgerEventType.OPTION_EXERCISE && 
            eventType != LedgerEventType.OPTION_ASSIGNMENT && 
            eventType != LedgerEventType.OPTION_EXPIRATION) {
            throw new IllegalArgumentException("Invalid event type for OptionLifecycleEvent");
        }
    }
}
