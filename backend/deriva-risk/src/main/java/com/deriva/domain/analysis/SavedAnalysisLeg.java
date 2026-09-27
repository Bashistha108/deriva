package com.deriva.domain.analysis;

import com.deriva.domain.market.OptionType;
import com.deriva.domain.trading.OrderSide;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "saved_analysis_legs")
public class SavedAnalysisLeg {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saved_analysis_id", nullable = false)
    private SavedAnalysis savedAnalysis;

    @Enumerated(EnumType.STRING)
    @Column(name = "option_type", nullable = false)
    private OptionType optionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderSide side;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal strike;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal premium;

    @Column(nullable = false)
    private Integer quantity;

    public SavedAnalysisLeg() {}

    // Getters and setters omitted for brevity...
}
