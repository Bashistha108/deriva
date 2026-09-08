package com.deriva.infrastructure.messaging.consumer;

import com.deriva.domain.event.OptionAssigned;
import com.deriva.domain.event.OptionExercised;
import com.deriva.domain.event.OptionExpired;
import com.deriva.infrastructure.messaging.idempotency.IdempotencyGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OptionLifecycleEventConsumer {

    private final IdempotencyGuard idempotencyGuard;

    @KafkaListener(topics = "option-lifecycle-events", groupId = "deriva-group")
    public void handleOptionExpired(OptionExpired event) {
        if (idempotencyGuard.isDuplicate(event.eventId(), "option-lifecycle-events")) {
            return;
        }
        log.info("Processed OptionExpired: {}", event);
    }

    @KafkaListener(topics = "option-lifecycle-events", groupId = "deriva-group")
    public void handleOptionAssigned(OptionAssigned event) {
        if (idempotencyGuard.isDuplicate(event.eventId(), "option-lifecycle-events")) {
            return;
        }
        log.info("Processed OptionAssigned: {}", event);
    }

    @KafkaListener(topics = "option-lifecycle-events", groupId = "deriva-group")
    public void handleOptionExercised(OptionExercised event) {
        if (idempotencyGuard.isDuplicate(event.eventId(), "option-lifecycle-events")) {
            return;
        }
        log.info("Processed OptionExercised: {}", event);
    }
}
