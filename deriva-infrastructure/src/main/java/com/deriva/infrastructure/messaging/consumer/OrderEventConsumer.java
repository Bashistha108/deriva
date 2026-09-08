package com.deriva.infrastructure.messaging.consumer;

import com.deriva.domain.event.OrderCreated;
import com.deriva.domain.event.OrderFilled;
import com.deriva.domain.event.PositionChanged;
import com.deriva.infrastructure.messaging.idempotency.IdempotencyGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final IdempotencyGuard idempotencyGuard;

    @KafkaListener(topics = "order-events", groupId = "deriva-group")
    public void handleOrderCreated(OrderCreated event) {
        if (idempotencyGuard.isDuplicate(event.eventId(), "order-events")) {
            return;
        }
        log.info("Processed OrderCreated: {}", event);
    }

    @KafkaListener(topics = "order-filled-events", groupId = "deriva-group")
    public void handleOrderFilled(OrderFilled event) {
        if (idempotencyGuard.isDuplicate(event.eventId(), "order-filled-events")) {
            return;
        }
        log.info("Processed OrderFilled: {}", event);
    }

    @KafkaListener(topics = "position-events", groupId = "deriva-group")
    public void handlePositionChanged(PositionChanged event) {
        if (idempotencyGuard.isDuplicate(event.eventId(), "position-events")) {
            return;
        }
        log.info("Processed PositionChanged: {}", event);
    }
}
