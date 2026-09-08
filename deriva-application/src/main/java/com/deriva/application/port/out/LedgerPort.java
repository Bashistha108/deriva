package com.deriva.application.port.out;

import com.deriva.domain.ledger.LedgerEntry;

public interface LedgerPort {
    /**
     * Appends an entry to the persistent ledger. Throws an exception if the entry violates idempotency.
     */
    LedgerEntry append(LedgerEntry entry);
}
