package com.deriva.domain.event;
import java.time.Instant;
import java.util.UUID;
public record OptionExercised(UUID eventId, Instant timestamp, UUID accountId, String optionSymbol, int quantity) implements DomainEvent {
    public OptionExercised {
        if (eventId == null) eventId = UUID.randomUUID();
        if (timestamp == null) timestamp = Instant.now();
    }
}
