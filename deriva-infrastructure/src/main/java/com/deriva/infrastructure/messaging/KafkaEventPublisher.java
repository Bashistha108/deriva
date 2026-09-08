package com.deriva.infrastructure.messaging;

import com.deriva.application.port.out.DomainEventPublisher;
import com.deriva.domain.event.DomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaEventPublisher implements DomainEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void publish(String topic, DomainEvent event) {
        log.debug("Publishing event to topic {}: {}", topic, event);
        kafkaTemplate.send(topic, event.eventId().toString(), event);
    }
}
