package com.deriva.domain.event;
import java.time.Instant;
import java.util.UUID;
import com.deriva.domain.order.OrderId;
public record OrderCreated(UUID eventId, Instant timestamp, UUID accountId, OrderId orderId) implements DomainEvent {
    public OrderCreated {
        if (eventId == null) eventId = UUID.randomUUID();
        if (timestamp == null) timestamp = Instant.now();
    }
}
