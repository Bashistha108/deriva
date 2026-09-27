package com.deriva.domain.simulation;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "market_ticks")
public class MarketTick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "simulation_run_id", nullable = false)
    private UUID simulationRunId;

    @Column(name = "simulated_timestamp", nullable = false)
    private LocalDateTime simulatedTimestamp;

    @Column(name = "sequence_number", nullable = false)
    private Long sequenceNumber;

    @Column(name = "calculation_started_at")
    private LocalDateTime calculationStartedAt;

    @Column(name = "calculation_completed_at")
    private LocalDateTime calculationCompletedAt;

    @Column(nullable = false)
    private String status;

    public MarketTick() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getSimulationRunId() { return simulationRunId; }
    public void setSimulationRunId(UUID simulationRunId) { this.simulationRunId = simulationRunId; }
    public LocalDateTime getSimulatedTimestamp() { return simulatedTimestamp; }
    public void setSimulatedTimestamp(LocalDateTime simulatedTimestamp) { this.simulatedTimestamp = simulatedTimestamp; }
    public Long getSequenceNumber() { return sequenceNumber; }
    public void setSequenceNumber(Long sequenceNumber) { this.sequenceNumber = sequenceNumber; }
    public LocalDateTime getCalculationStartedAt() { return calculationStartedAt; }
    public void setCalculationStartedAt(LocalDateTime calculationStartedAt) { this.calculationStartedAt = calculationStartedAt; }
    public LocalDateTime getCalculationCompletedAt() { return calculationCompletedAt; }
    public void setCalculationCompletedAt(LocalDateTime calculationCompletedAt) { this.calculationCompletedAt = calculationCompletedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
