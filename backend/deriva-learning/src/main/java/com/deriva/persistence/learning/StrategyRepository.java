package com.deriva.persistence.learning;

import com.deriva.domain.learning.Strategy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StrategyRepository extends JpaRepository<Strategy, UUID> {
    Optional<Strategy> findBySlug(String slug);
}
