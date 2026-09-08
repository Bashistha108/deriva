package com.deriva.domain.ledger.events;

import com.deriva.domain.ledger.LedgerEventType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CashMovementEvent(
        UUID eventId,
        UUID accountId,
        LedgerEventType eventType,
        Instant timestamp,
        BigDecimal amount,
        String currency
) implements LedgerEvent {
    public CashMovementEvent {
        if (eventType != LedgerEventType.CASH_DEPOSIT && eventType != LedgerEventType.CASH_WITHDRAWAL) {
            throw new IllegalArgumentException("Invalid event type for CashMovementEvent");
        }
    }
}
