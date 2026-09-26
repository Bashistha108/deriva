package com.deriva.persistence.simulation;

import com.deriva.domain.simulation.SimulationRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SimulationRunRepository extends JpaRepository<SimulationRun, UUID> {
}
