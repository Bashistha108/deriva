package com.deriva.domain.simulation;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "market_configurations")
public class MarketConfiguration {

    @Id
    private Long id;

    @Column(name = "risk_free_rate", nullable = false, precision = 19, scale = 6)
    private BigDecimal riskFreeRate;

    @Column(name = "calculation_interval_seconds", nullable = false)
    private Integer calculationIntervalSeconds;

    @Column(name = "live_update_interval_seconds", nullable = false)
    private Integer liveUpdateIntervalSeconds;

    @Column(name = "persistence_interval_seconds", nullable = false)
    private Integer persistenceIntervalSeconds;

    @Column(name = "market_open_time", nullable = false)
    private LocalTime marketOpenTime;

    @Column(name = "market_close_time", nullable = false)
    private LocalTime marketCloseTime;

    @Column(name = "settlement_start_time", nullable = false)
    private LocalTime settlementStartTime;

    @Column(name = "settlement_end_time", nullable = false)
    private LocalTime settlementEndTime;

    @Column(nullable = false)
    private String timezone;

    @Column(name = "market_status", nullable = false)
    private String marketStatus;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", nullable = false)
    private UUID updatedBy;

    public MarketConfiguration() {}

    // Getters and setters omitted for brevity...
}
