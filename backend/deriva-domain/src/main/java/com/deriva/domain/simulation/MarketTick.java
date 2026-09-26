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
    
    // Getters and setters...
}
