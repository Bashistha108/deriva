package com.deriva.application.port.out;

import com.deriva.domain.ledger.LedgerEntry;

import com.deriva.domain.ledger.events.LedgerEvent;

import java.util.List;
import java.util.UUID;

public interface LedgerPort {
    /**
     * Appends an event to the persistent ledger. Throws an exception if the entry violates idempotency.
     */
    LedgerEntry append(LedgerEvent event);

    /**
     * Fetches all ledger events for an account, ordered by creation time.
     */
    List<LedgerEvent> getEventsByAccountId(UUID accountId);
}
