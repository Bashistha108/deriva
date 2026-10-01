package com.deriva.domain.portfolio;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "portfolio_snapshots")
public class PortfolioSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "market_tick_id", nullable = false)
    private Long marketTickId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "cash_balance", nullable = false, precision = 19, scale = 4)
    private BigDecimal cashBalance;

    @Column(name = "reserved_cash", nullable = false, precision = 19, scale = 4)
    private BigDecimal reservedCash;

    @Column(name = "available_cash", nullable = false, precision = 19, scale = 4)
    private BigDecimal availableCash;

    @Column(name = "portfolio_value", nullable = false, precision = 19, scale = 4)
    private BigDecimal portfolioValue;

    @Column(name = "total_equity", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalEquity;

    @Column(name = "realized_pnl", nullable = false, precision = 19, scale = 4)
    private BigDecimal realizedPnl;

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

    public PortfolioSnapshot() {}

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMarketTickId() { return marketTickId; }
    public void setMarketTickId(Long marketTickId) { this.marketTickId = marketTickId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public BigDecimal getCashBalance() { return cashBalance; }
    public void setCashBalance(BigDecimal cashBalance) { this.cashBalance = cashBalance; }

    public BigDecimal getReservedCash() { return reservedCash; }
    public void setReservedCash(BigDecimal reservedCash) { this.reservedCash = reservedCash; }

    public BigDecimal getAvailableCash() { return availableCash; }
    public void setAvailableCash(BigDecimal availableCash) { this.availableCash = availableCash; }

    public BigDecimal getPortfolioValue() { return portfolioValue; }
    public void setPortfolioValue(BigDecimal portfolioValue) { this.portfolioValue = portfolioValue; }

    public BigDecimal getTotalEquity() { return totalEquity; }
    public void setTotalEquity(BigDecimal totalEquity) { this.totalEquity = totalEquity; }

    public BigDecimal getRealizedPnl() { return realizedPnl; }
    public void setRealizedPnl(BigDecimal realizedPnl) { this.realizedPnl = realizedPnl; }

    public BigDecimal getUnrealizedPnl() { return unrealizedPnl; }
    public void setUnrealizedPnl(BigDecimal unrealizedPnl) { this.unrealizedPnl = unrealizedPnl; }

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

}
