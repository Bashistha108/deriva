package com.deriva.domain.ledger.events;

import com.deriva.domain.ledger.LedgerEventType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FeeEvent(
        UUID eventId,
        UUID accountId,
        Instant timestamp,
        BigDecimal amount,
        String currency,
        String reason
) implements LedgerEvent {
    @Override
    public LedgerEventType eventType() {
        return LedgerEventType.FEE;
    }
}
