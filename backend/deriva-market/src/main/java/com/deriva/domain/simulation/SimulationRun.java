package com.deriva.domain.simulation;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "simulation_runs")
public class SimulationRun {

    @Id
    private UUID id;

    @Column(nullable = false)
    private Long seed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SimulationRunStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public SimulationRun() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Long getSeed() { return seed; }
    public void setSeed(Long seed) { this.seed = seed; }

    public SimulationRunStatus getStatus() { return status; }
    public void setStatus(SimulationRunStatus status) { this.status = status; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
