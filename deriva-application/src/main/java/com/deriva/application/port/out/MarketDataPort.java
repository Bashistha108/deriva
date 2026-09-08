package com.deriva.application.port.out;

import java.math.BigDecimal;

public interface MarketDataPort {
    /**
     * Gets the latest price for a given asset symbol.
     */
    BigDecimal getLatestPrice(String symbol);
}
