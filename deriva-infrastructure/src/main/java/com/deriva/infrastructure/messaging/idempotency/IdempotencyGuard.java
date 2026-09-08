package com.deriva.infrastructure.messaging.idempotency;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class IdempotencyGuard {

    private final IdempotentEventRepository repository;

    @Transactional
    public boolean isDuplicate(UUID eventId, String topic) {
        if (repository.existsById(eventId)) {
            log.info("Event {} already processed. Skipping.", eventId);
            return true;
        }

        try {
            repository.saveAndFlush(new IdempotentEventEntity(eventId, topic, Instant.now()));
            return false;
        } catch (DataIntegrityViolationException e) {
            log.info("Concurrent processing detected for event {}. Skipping.", eventId);
            return true;
        }
    }
}
