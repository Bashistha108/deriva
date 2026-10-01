package com.deriva.api.dto;

import java.math.BigDecimal;

public class WatchlistInstrumentDTO {
    private Long id;
    private String symbol;
    private String name;
    private BigDecimal price;
    private BigDecimal change;
    private BigDecimal changePercent;
    private BigDecimal iv;
    private BigDecimal ivPercentile;
    private BigDecimal ivRank;

    public WatchlistInstrumentDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getChange() { return change; }
    public void setChange(BigDecimal change) { this.change = change; }

    public BigDecimal getChangePercent() { return changePercent; }
    public void setChangePercent(BigDecimal changePercent) { this.changePercent = changePercent; }

    public BigDecimal getIv() { return iv; }
    public void setIv(BigDecimal iv) { this.iv = iv; }

    public BigDecimal getIvPercentile() { return ivPercentile; }
    public void setIvPercentile(BigDecimal ivPercentile) { this.ivPercentile = ivPercentile; }

    public BigDecimal getIvRank() { return ivRank; }
    public void setIvRank(BigDecimal ivRank) { this.ivRank = ivRank; }
}
