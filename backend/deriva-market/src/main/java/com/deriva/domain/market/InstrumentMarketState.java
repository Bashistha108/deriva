package com.deriva.domain.market;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "instrument_market_states")
public class InstrumentMarketState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "instrument_id", nullable = false, unique = true)
    private Long instrumentId;

    @Column(name = "market_tick_id", nullable = false)
    private Long marketTickId;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal volatility;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal drift;

    @Column(nullable = false)
    private Long volume;

    @Column(name = "market_regime", nullable = false)
    private String marketRegime;

    public InstrumentMarketState() {}

    // getters and setters omitted for brevity
}
