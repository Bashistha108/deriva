package com.deriva.domain.ledger.events;

import com.deriva.domain.ledger.LedgerEventType;
import java.time.Instant;
import java.util.UUID;

public interface LedgerEvent {
    UUID eventId();
    UUID accountId();
    LedgerEventType eventType();
    Instant timestamp();
}
