package com.deriva.domain.market;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "instrument_simulation_parameters")
public class InstrumentSimulationParameter {

    @Id
    @Column(name = "instrument_id")
    private Long instrumentId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "instrument_id")
    private Instrument instrument;

    @Column(name = "base_volatility", nullable = false, precision = 19, scale = 6)
    private BigDecimal baseVolatility;

    @Column(nullable = false, precision = 19, scale = 6)
    private BigDecimal drift;

    @Column(name = "market_beta", nullable = false, precision = 19, scale = 6)
    private BigDecimal marketBeta;

    @Column(name = "sector_beta", nullable = false, precision = 19, scale = 6)
    private BigDecimal sectorBeta;

    @Column(name = "liquidity_factor", nullable = false, precision = 19, scale = 6)
    private BigDecimal liquidityFactor;

    @Column(name = "average_volume", nullable = false)
    private Long averageVolume;

    @Column(name = "price_floor", nullable = false, precision = 19, scale = 4)
    private BigDecimal priceFloor;

    @Column(name = "price_ceiling", nullable = false, precision = 19, scale = 4)
    private BigDecimal priceCeiling;

    @Column(name = "jump_probability", nullable = false, precision = 19, scale = 6)
    private BigDecimal jumpProbability;

    @Column(name = "jump_size_factor", nullable = false, precision = 19, scale = 6)
    private BigDecimal jumpSizeFactor;

    @Column(nullable = false)
    private boolean enabled;

    public InstrumentSimulationParameter() {}

    public Long getInstrumentId() { return instrumentId; }
    public void setInstrumentId(Long instrumentId) { this.instrumentId = instrumentId; }

    public Instrument getInstrument() { return instrument; }
    public void setInstrument(Instrument instrument) { this.instrument = instrument; }

    public BigDecimal getBaseVolatility() { return baseVolatility; }
    public void setBaseVolatility(BigDecimal baseVolatility) { this.baseVolatility = baseVolatility; }

    public BigDecimal getDrift() { return drift; }
    public void setDrift(BigDecimal drift) { this.drift = drift; }

    public BigDecimal getMarketBeta() { return marketBeta; }
    public void setMarketBeta(BigDecimal marketBeta) { this.marketBeta = marketBeta; }

    public BigDecimal getSectorBeta() { return sectorBeta; }
    public void setSectorBeta(BigDecimal sectorBeta) { this.sectorBeta = sectorBeta; }

    public BigDecimal getLiquidityFactor() { return liquidityFactor; }
    public void setLiquidityFactor(BigDecimal liquidityFactor) { this.liquidityFactor = liquidityFactor; }

    public Long getAverageVolume() { return averageVolume; }
    public void setAverageVolume(Long averageVolume) { this.averageVolume = averageVolume; }

    public BigDecimal getPriceFloor() { return priceFloor; }
    public void setPriceFloor(BigDecimal priceFloor) { this.priceFloor = priceFloor; }

    public BigDecimal getPriceCeiling() { return priceCeiling; }
    public void setPriceCeiling(BigDecimal priceCeiling) { this.priceCeiling = priceCeiling; }

    public BigDecimal getJumpProbability() { return jumpProbability; }
    public void setJumpProbability(BigDecimal jumpProbability) { this.jumpProbability = jumpProbability; }

    public BigDecimal getJumpSizeFactor() { return jumpSizeFactor; }
    public void setJumpSizeFactor(BigDecimal jumpSizeFactor) { this.jumpSizeFactor = jumpSizeFactor; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
