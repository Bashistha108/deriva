package com.deriva.domain.simulation;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "simulation_state")
public class SimulationState {

    @Id
    private UUID id;

    @Column(name = "simulation_run_id", nullable = false)
    private UUID simulationRunId;

    @Column(name = "current_simulated_timestamp", nullable = false)
    private LocalDateTime currentSimulatedTimestamp;

    @Column(name = "current_market_session_id")
    private Long currentMarketSessionId;

    @Column(name = "last_completed_tick_id")
    private Long lastCompletedTickId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SimulationRunStatus status;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public SimulationState() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getSimulationRunId() { return simulationRunId; }
    public void setSimulationRunId(UUID simulationRunId) { this.simulationRunId = simulationRunId; }

    public LocalDateTime getCurrentSimulatedTimestamp() { return currentSimulatedTimestamp; }
    public void setCurrentSimulatedTimestamp(LocalDateTime currentSimulatedTimestamp) { this.currentSimulatedTimestamp = currentSimulatedTimestamp; }

    public Long getCurrentMarketSessionId() { return currentMarketSessionId; }
    public void setCurrentMarketSessionId(Long currentMarketSessionId) { this.currentMarketSessionId = currentMarketSessionId; }

    public Long getLastCompletedTickId() { return lastCompletedTickId; }
    public void setLastCompletedTickId(Long lastCompletedTickId) { this.lastCompletedTickId = lastCompletedTickId; }

    public SimulationRunStatus getStatus() { return status; }
    public void setStatus(SimulationRunStatus status) { this.status = status; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
