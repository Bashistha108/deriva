package com.deriva.persistence.simulation;

import com.deriva.domain.simulation.MarketSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MarketSessionRepository extends JpaRepository<MarketSession, Long> {
}
