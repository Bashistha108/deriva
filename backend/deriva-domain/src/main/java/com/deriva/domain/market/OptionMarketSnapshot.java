package com.deriva.domain.market;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "option_market_snapshots")
public class OptionMarketSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "market_tick_id", nullable = false)
    private Long marketTickId;

    @Column(name = "option_contract_id", nullable = false)
    private Long optionContractId;

    @Column(name = "market_session_id", nullable = false)
    private Long marketSessionId;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "underlying_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal underlyingPrice;

    @Column(name = "theoretical_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal theoreticalPrice;

    @Column(name = "bid_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal bidPrice;

    @Column(name = "ask_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal askPrice;

    @Column(name = "mid_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal midPrice;

    @Column(name = "implied_volatility", precision = 19, scale = 6)
    private BigDecimal impliedVolatility;

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

    @Column(nullable = false)
    private Long volume;

    @Column(name = "open_interest", nullable = false)
    private Long openInterest;

    public OptionMarketSnapshot() {}

    // Getters and setters omitted for brevity...
}
