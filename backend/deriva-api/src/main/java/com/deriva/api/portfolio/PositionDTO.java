package com.deriva.api.portfolio;

import com.deriva.domain.market.OptionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class PositionDTO {
    private UUID id;
    private Long instrumentId;
    private Long optionContractId;
    private Integer quantity;
    private BigDecimal averageEntryPrice;
    private BigDecimal realizedPnl;
    
    // Additional fields for frontend grouping
    private String symbol;
    private String name;
    private String type; // "STOCK" or "OPTION"
    private LocalDate expirationDate;
    private BigDecimal strikePrice;
    private OptionType optionType; // CALL or PUT
    private Integer contractMultiplier;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public Long getInstrumentId() { return instrumentId; }
    public void setInstrumentId(Long instrumentId) { this.instrumentId = instrumentId; }
    
    public Long getOptionContractId() { return optionContractId; }
    public void setOptionContractId(Long optionContractId) { this.optionContractId = optionContractId; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getAverageEntryPrice() { return averageEntryPrice; }
    public void setAverageEntryPrice(BigDecimal averageEntryPrice) { this.averageEntryPrice = averageEntryPrice; }
    
    public BigDecimal getRealizedPnl() { return realizedPnl; }
    public void setRealizedPnl(BigDecimal realizedPnl) { this.realizedPnl = realizedPnl; }
    
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }
    
    public BigDecimal getStrikePrice() { return strikePrice; }
    public void setStrikePrice(BigDecimal strikePrice) { this.strikePrice = strikePrice; }
    
    public OptionType getOptionType() { return optionType; }
    public void setOptionType(OptionType optionType) { this.optionType = optionType; }

    public Integer getContractMultiplier() { return contractMultiplier; }
    public void setContractMultiplier(Integer contractMultiplier) { this.contractMultiplier = contractMultiplier; }

    private BigDecimal currentPrice;
    private BigDecimal unrealizedPnl;
    private BigDecimal delta;
    private BigDecimal gamma;
    private BigDecimal theta;
    private BigDecimal vega;

    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }
    
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
}
