package com.deriva.application.service;

import com.deriva.domain.ledger.events.LedgerEvent;
import com.deriva.domain.ledger.LedgerEntry;

public interface LedgerService {
    /**
     * Appends a new event to the immutable ledger.
     * Guarantees idempotency based on the eventId.
     *
     * @param event The event to record
     * @return The resulting immutable ledger entry
     * @throws IllegalStateException if the event has already been recorded
     */
    LedgerEntry recordEvent(LedgerEvent event);
}
