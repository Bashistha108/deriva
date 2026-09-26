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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMarketTickId() { return marketTickId; }
    public void setMarketTickId(Long marketTickId) { this.marketTickId = marketTickId; }
    public Long getOptionContractId() { return optionContractId; }
    public void setOptionContractId(Long optionContractId) { this.optionContractId = optionContractId; }
    public Long getMarketSessionId() { return marketSessionId; }
    public void setMarketSessionId(Long marketSessionId) { this.marketSessionId = marketSessionId; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public BigDecimal getUnderlyingPrice() { return underlyingPrice; }
    public void setUnderlyingPrice(BigDecimal underlyingPrice) { this.underlyingPrice = underlyingPrice; }
    public BigDecimal getTheoreticalPrice() { return theoreticalPrice; }
    public void setTheoreticalPrice(BigDecimal theoreticalPrice) { this.theoreticalPrice = theoreticalPrice; }
    public BigDecimal getBidPrice() { return bidPrice; }
    public void setBidPrice(BigDecimal bidPrice) { this.bidPrice = bidPrice; }
    public BigDecimal getAskPrice() { return askPrice; }
    public void setAskPrice(BigDecimal askPrice) { this.askPrice = askPrice; }
    public BigDecimal getMidPrice() { return midPrice; }
    public void setMidPrice(BigDecimal midPrice) { this.midPrice = midPrice; }
    public BigDecimal getImpliedVolatility() { return impliedVolatility; }
    public void setImpliedVolatility(BigDecimal impliedVolatility) { this.impliedVolatility = impliedVolatility; }
    public BigDecimal getDelta() { return delta; }
    public void setDelta(BigDecimal delta) { this.delta = delta; }
    public BigDecimal getGamma() { return gamma; }
    public void setGamma(BigDecimal gamma) { this.gamma = gamma; }
    public BigDecimal getTheta() { return theta; }
    public void setTheta(BigDecimal theta) { this.theta = theta; }
    public BigDecimal getVega() { return vega; }
    public void setVega(BigDecimal vega) { this.vega = vega; }
    public BigDecimal getRho() { return rho; }
    public void setRho(BigDecimal rho) { this.rho = rho; }
    public Long getVolume() { return volume; }
    public void setVolume(Long volume) { this.volume = volume; }
    public Long getOpenInterest() { return openInterest; }
    public void setOpenInterest(Long openInterest) { this.openInterest = openInterest; }
}
