package com.deriva.infrastructure.service;

import com.deriva.application.port.out.LedgerPort;
import com.deriva.domain.ledger.LedgerEntry;
import com.deriva.domain.ledger.events.LedgerEvent;
import com.deriva.domain.ledger.LedgerEventType;
import com.deriva.domain.ledger.events.*;
import com.deriva.infrastructure.persistence.ledger.LedgerEntryEntity;
import com.deriva.infrastructure.persistence.ledger.LedgerEntryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LedgerPortImpl implements LedgerPort {

    private final LedgerEntryRepository repository;
    private final ObjectMapper objectMapper;

    public LedgerPortImpl(LedgerEntryRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public LedgerEntry append(LedgerEvent event) {
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
        }

        String payload;
        try {
            payload = objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize ledger event", e);
        }

        LedgerEntryEntity entity = new LedgerEntryEntity(
                entryId,
                event.accountId(),
                event.eventType().name(),
                event.eventId(),
                amount,
                currency,
                reference,
                payload,
                event.timestamp()
        );

        try {
            LedgerEntryEntity saved = repository.save(entity);
            return new LedgerEntry(
                    saved.getId(),
                    saved.getAccountId(),
                    LedgerEventType.valueOf(saved.getEventType()),
                    saved.getEventId(),
                    saved.getAmount(),
                    saved.getCurrency(),
                    saved.getReferenceEntityId(),
                    saved.getPayload(),
                    saved.getCreatedAt()
            );
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("Event " + event.eventId() + " already recorded for account " + event.accountId(), ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<LedgerEvent> getEventsByAccountId(UUID accountId) {
        return repository.findByAccountIdOrderByCreatedAtAsc(accountId).stream()
                .map(entity -> {
                    try {
                        // To deserialize, we need to know the exact class. We can use Jackson polymorphic deserialization 
                        // or a switch statement based on eventType.
                        return deserializeEvent(entity.getEventType(), entity.getPayload());
                    } catch (Exception e) {
                        throw new IllegalStateException("Failed to deserialize event payload for entity " + entity.getId(), e);
                    }
                })
                .collect(Collectors.toList());
    }

    private LedgerEvent deserializeEvent(String eventType, String payload) throws JsonProcessingException {
        LedgerEventType type = LedgerEventType.valueOf(eventType);
        return switch (type) {
            case CASH_DEPOSIT, CASH_WITHDRAWAL -> objectMapper.readValue(payload, CashMovementEvent.class);
            case TRADE_EXECUTION -> objectMapper.readValue(payload, TradeExecutionEvent.class);
            case FEE -> objectMapper.readValue(payload, FeeEvent.class);
            case DIVIDEND -> objectMapper.readValue(payload, DividendEvent.class);
            case INTEREST -> objectMapper.readValue(payload, InterestEvent.class);
            case OPTION_EXERCISE, OPTION_ASSIGNMENT, OPTION_EXPIRATION -> objectMapper.readValue(payload, OptionLifecycleEvent.class);
        };
    }
}
