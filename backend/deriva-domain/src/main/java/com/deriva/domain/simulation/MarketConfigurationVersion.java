package com.deriva.domain.simulation;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "market_configuration_versions")
public class MarketConfigurationVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "effective_from", nullable = false)
    private LocalDateTime effectiveFrom;

    @Column(name = "effective_until")
    private LocalDateTime effectiveUntil;

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

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    public MarketConfigurationVersion() {}

    // Getters and setters...
}
