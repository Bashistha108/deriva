package com.deriva.domain.learning;

import com.deriva.domain.market.OptionType;
import com.deriva.domain.trading.OrderSide;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "strategy_legs")
public class StrategyLeg {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategy_id", nullable = false)
    private Strategy strategy;

    @Enumerated(EnumType.STRING)
    @Column(name = "option_type", nullable = false)
    private OptionType optionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderSide side;

    @Column(name = "strike_offset", nullable = false, precision = 19, scale = 4)
    private BigDecimal strikeOffset;

    @Column(name = "quantity_ratio", nullable = false)
    private Integer quantityRatio;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    public StrategyLeg() {}

    // Getters and setters omitted for brevity...
}
