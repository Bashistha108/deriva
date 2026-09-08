package com.deriva.application.port.out;

import com.deriva.domain.event.DomainEvent;

public interface DomainEventPublisher {
    void publish(String topic, DomainEvent event);
}
