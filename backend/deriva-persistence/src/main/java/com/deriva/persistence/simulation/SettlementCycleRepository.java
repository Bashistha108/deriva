package com.deriva.persistence.simulation;

import com.deriva.domain.simulation.SettlementCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SettlementCycleRepository extends JpaRepository<SettlementCycle, UUID> {
    Optional<SettlementCycle> findByMarketSessionId(Long marketSessionId);
}
