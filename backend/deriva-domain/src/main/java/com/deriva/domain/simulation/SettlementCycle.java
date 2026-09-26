package com.deriva.domain.simulation;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "settlement_cycles")
public class SettlementCycle {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "simulation_run_id", nullable = false)
    private UUID simulationRunId;

    @Column(name = "market_session_id", nullable = false)
    private Long marketSessionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SettlementCycleStatus status;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public SettlementCycle() {}

    // Getters and setters omitted for brevity...
}
