package com.deriva.domain.ledger;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record LedgerEntry(
        UUID id,
        UUID accountId,
        LedgerEventType eventType,
        UUID eventId,
        BigDecimal amount,
        String currency,
        String referenceEntityId,
        String payload,
        Instant createdAt
) {
    public LedgerEntry {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        if (accountId == null) throw new IllegalArgumentException("Account ID cannot be null");
        if (eventType == null) throw new IllegalArgumentException("Event Type cannot be null");
        if (eventId == null) throw new IllegalArgumentException("Event ID cannot be null");
        if (amount == null) throw new IllegalArgumentException("Amount cannot be null");
        if (currency == null) throw new IllegalArgumentException("Currency cannot be null");
        if (payload == null) throw new IllegalArgumentException("Payload cannot be null");
        if (createdAt == null) throw new IllegalArgumentException("Created At cannot be null");
    }
}
