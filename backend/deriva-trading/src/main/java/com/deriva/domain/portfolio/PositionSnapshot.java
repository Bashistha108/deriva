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

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMarketTickId() { return marketTickId; }
    public void setMarketTickId(Long marketTickId) { this.marketTickId = marketTickId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getPositionId() { return positionId; }
    public void setPositionId(UUID positionId) { this.positionId = positionId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getMarketPrice() { return marketPrice; }
    public void setMarketPrice(BigDecimal marketPrice) { this.marketPrice = marketPrice; }

    public BigDecimal getMarketValue() { return marketValue; }
    public void setMarketValue(BigDecimal marketValue) { this.marketValue = marketValue; }

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
