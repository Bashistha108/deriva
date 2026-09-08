package com.deriva.infrastructure.persistence.ledger;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ledger_entry")
public class LedgerEntryEntity {
    @Id
    private UUID id;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "reference_entity_id")
    private String referenceEntityId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected LedgerEntryEntity() {
    }

    public LedgerEntryEntity(UUID id, UUID accountId, String eventType, UUID eventId, BigDecimal amount, String currency, String referenceEntityId, Instant createdAt) {
        this.id = id;
        this.accountId = accountId;
        this.eventType = eventType;
        this.eventId = eventId;
        this.amount = amount;
        this.currency = currency;
        this.referenceEntityId = referenceEntityId;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getAccountId() { return accountId; }
    public String getEventType() { return eventType; }
    public UUID getEventId() { return eventId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getReferenceEntityId() { return referenceEntityId; }
    public Instant getCreatedAt() { return createdAt; }
}
