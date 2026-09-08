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
        LedgerEntry entry = mapToEntry(event);
        return ledgerPort.append(entry);
    }

    private LedgerEntry mapToEntry(LedgerEvent event) {
        UUID entryId = UUID.randomUUID();
        BigDecimal amount = BigDecimal.ZERO;
        String currency = "USD";
        String reference = null;

        if (event instanceof CashMovementEvent cashEvent) {
            amount = cashEvent.amount();
            currency = cashEvent.currency();
        } else if (event instanceof TradeExecutionEvent tradeEvent) {
            amount = tradeEvent.amount();
            currency = tradeEvent.currency();
            reference = tradeEvent.tradeId();
        } else if (event instanceof FeeEvent feeEvent) {
            amount = feeEvent.amount();
            currency = feeEvent.currency();
            reference = feeEvent.reason();
        } else if (event instanceof DividendEvent dividendEvent) {
            amount = dividendEvent.amount();
            currency = dividendEvent.currency();
            reference = dividendEvent.symbol();
        } else if (event instanceof InterestEvent interestEvent) {
            amount = interestEvent.amount();
            currency = interestEvent.currency();
        } else if (event instanceof OptionLifecycleEvent optionEvent) {
            amount = optionEvent.amount();
            currency = optionEvent.currency();
            reference = optionEvent.contractSymbol();
        } else {
            amount = BigDecimal.ZERO;
        }

        return new LedgerEntry(
                entryId,
                event.accountId(),
                event.eventType(),
                event.eventId(),
                amount,
                currency,
                reference,
                event.timestamp()
        );
    }
}
