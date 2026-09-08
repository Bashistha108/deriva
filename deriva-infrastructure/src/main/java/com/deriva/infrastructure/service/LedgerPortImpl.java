package com.deriva.infrastructure.service;

import com.deriva.application.port.out.LedgerPort;
import com.deriva.domain.ledger.LedgerEntry;
import com.deriva.domain.ledger.LedgerEventType;
import com.deriva.infrastructure.persistence.ledger.LedgerEntryEntity;
import com.deriva.infrastructure.persistence.ledger.LedgerEntryRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LedgerPortImpl implements LedgerPort {

    private final LedgerEntryRepository repository;

    public LedgerPortImpl(LedgerEntryRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public LedgerEntry append(LedgerEntry entry) {
        LedgerEntryEntity entity = new LedgerEntryEntity(
                entry.id(),
                entry.accountId(),
                entry.eventType().name(),
                entry.eventId(),
                entry.amount(),
                entry.currency(),
                entry.referenceEntityId(),
                entry.createdAt()
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
                    saved.getCreatedAt()
            );
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("Event " + entry.eventId() + " already recorded for account " + entry.accountId(), ex);
        }
    }
}
