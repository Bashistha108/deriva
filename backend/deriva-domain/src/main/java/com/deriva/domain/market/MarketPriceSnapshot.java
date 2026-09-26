package com.deriva.domain.market;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "market_price_snapshots")
public class MarketPriceSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "market_tick_id", nullable = false)
    private Long marketTickId;

    @Column(name = "simulation_run_id", nullable = false)
    private UUID simulationRunId;

    @Column(name = "instrument_id", nullable = false)
    private Long instrumentId;

    @Column(name = "market_session_id", nullable = false)
    private Long marketSessionId;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(name = "previous_price", precision = 19, scale = 4)
    private BigDecimal previousPrice;

    @Column(precision = 19, scale = 4)
    private BigDecimal change;

    @Column(name = "change_percent", precision = 19, scale = 4)
    private BigDecimal changePercent;

    @Column(nullable = false)
    private Long volume;

    public MarketPriceSnapshot() {}

    // getters and setters omitted for brevity
}
