package com.deriva.persistence.simulation;

import com.deriva.domain.simulation.SimulationState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SimulationStateRepository extends JpaRepository<SimulationState, UUID> {
    Optional<SimulationState> findBySimulationRunId(UUID simulationRunId);
}
