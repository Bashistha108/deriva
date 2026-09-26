package com.deriva.domain.analysis;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "saved_analyses")
public class SavedAnalysis {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(name = "strategy_id")
    private UUID strategyId;

    @Column(name = "underlying_instrument_id", nullable = false)
    private Long underlyingInstrumentId;

    @Column(name = "underlying_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal underlyingPrice;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal volatility;

    @Column(name = "risk_free_rate", nullable = false, precision = 19, scale = 6)
    private BigDecimal riskFreeRate;

    @Column(name = "days_to_expiration", nullable = false)
    private Integer daysToExpiration;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "savedAnalysis", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SavedAnalysisLeg> legs = new ArrayList<>();

    public SavedAnalysis() {}

    // Getters and setters omitted for brevity...
}
