package com.deriva.infrastructure.messaging.consumer;

import com.deriva.domain.event.MarketQuoteUpdated;
import com.deriva.infrastructure.messaging.idempotency.IdempotencyGuard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MarketDataEventConsumer {

    private final IdempotencyGuard idempotencyGuard;

    @KafkaListener(topics = "market-quote-updates", groupId = "deriva-group")
    public void handleMarketQuoteUpdated(MarketQuoteUpdated event) {
        if (idempotencyGuard.isDuplicate(event.eventId(), "market-quote-updates")) {
            return;
        }
        log.info("Processed MarketQuoteUpdated: {}", event);
        // TODO: Update in-memory quotes, trigger re-pricing if necessary
    }
}
