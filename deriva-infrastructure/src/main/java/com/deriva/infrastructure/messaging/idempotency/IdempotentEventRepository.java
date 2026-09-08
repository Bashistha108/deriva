package com.deriva.infrastructure.messaging.idempotency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface IdempotentEventRepository extends JpaRepository<IdempotentEventEntity, UUID> {
}
