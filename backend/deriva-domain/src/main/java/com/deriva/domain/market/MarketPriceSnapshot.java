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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMarketTickId() { return marketTickId; }
    public void setMarketTickId(Long marketTickId) { this.marketTickId = marketTickId; }
    public UUID getSimulationRunId() { return simulationRunId; }
    public void setSimulationRunId(UUID simulationRunId) { this.simulationRunId = simulationRunId; }
    public Long getInstrumentId() { return instrumentId; }
    public void setInstrumentId(Long instrumentId) { this.instrumentId = instrumentId; }
    public Long getMarketSessionId() { return marketSessionId; }
    public void setMarketSessionId(Long marketSessionId) { this.marketSessionId = marketSessionId; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getPreviousPrice() { return previousPrice; }
    public void setPreviousPrice(BigDecimal previousPrice) { this.previousPrice = previousPrice; }
    public BigDecimal getChange() { return change; }
    public void setChange(BigDecimal change) { this.change = change; }
    public BigDecimal getChangePercent() { return changePercent; }
    public void setChangePercent(BigDecimal changePercent) { this.changePercent = changePercent; }
    public Long getVolume() { return volume; }
    public void setVolume(Long volume) { this.volume = volume; }
}
