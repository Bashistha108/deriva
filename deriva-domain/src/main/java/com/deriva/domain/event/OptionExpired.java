package com.deriva.domain.event;
import java.time.Instant;
import java.util.UUID;
public record OptionExpired(UUID eventId, Instant timestamp, UUID accountId, String optionSymbol) implements DomainEvent {
    public OptionExpired {
        if (eventId == null) eventId = UUID.randomUUID();
        if (timestamp == null) timestamp = Instant.now();
    }
}
