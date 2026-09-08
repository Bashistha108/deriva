package com.deriva.application.service.impl;

import com.deriva.application.port.out.LedgerPort;
import com.deriva.application.service.LedgerService;
import com.deriva.domain.ledger.LedgerEntry;
import com.deriva.domain.ledger.events.*;

import java.math.BigDecimal;
import java.util.UUID;

public class LedgerServiceImpl implements LedgerService {

    private final LedgerPort ledgerPort;

    public LedgerServiceImpl(LedgerPort ledgerPort) {
        this.ledgerPort = ledgerPort;
    }

    @Override
    public LedgerEntry recordEvent(LedgerEvent event) {
        return ledgerPort.append(event);
    }
}
