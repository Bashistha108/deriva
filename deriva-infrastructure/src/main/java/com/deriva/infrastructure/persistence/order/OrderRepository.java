package com.deriva.infrastructure.persistence.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {
    boolean existsByAccountIdAndIdempotencyKey(UUID accountId, String idempotencyKey);
}
