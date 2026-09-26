package com.deriva.domain.portfolio;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "position_snapshots")
public class PositionSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "market_tick_id", nullable = false)
    private Long marketTickId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "position_id", nullable = false)
    private UUID positionId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "market_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal marketPrice;

    @Column(name = "market_value", nullable = false, precision = 19, scale = 4)
    private BigDecimal marketValue;

    @Column(name = "unrealized_pnl", nullable = false, precision = 19, scale = 4)
    private BigDecimal unrealizedPnl;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal delta;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal gamma;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal theta;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal vega;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal rho;

    public PositionSnapshot() {}

    // Getters and setters omitted for brevity...
}
