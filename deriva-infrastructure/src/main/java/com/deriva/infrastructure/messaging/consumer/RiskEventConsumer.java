package com.deriva.infrastructure.messaging.consumer;

import com.deriva.domain.event.RiskLimitBreached;
import com.deriva.infrastructure.messaging.idempotency.IdempotencyGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RiskEventConsumer {

    private final IdempotencyGuard idempotencyGuard;

    @KafkaListener(topics = "risk-events", groupId = "deriva-group")
    public void handleRiskLimitBreached(RiskLimitBreached event) {
        if (idempotencyGuard.isDuplicate(event.eventId(), "risk-events")) {
            return;
        }
        log.warn("Processed RiskLimitBreached: {}", event);
    }
}
