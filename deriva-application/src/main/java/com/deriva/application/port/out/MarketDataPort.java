package com.deriva.application.port.out;

import com.deriva.domain.common.Symbol;
import com.deriva.domain.marketdata.MarketQuote;
import com.deriva.domain.marketdata.OptionQuote;

import java.math.BigDecimal;
import java.util.List;

public interface MarketDataPort {
    /**
     * Gets the latest price for a given asset symbol.
     */
    BigDecimal getLatestPrice(String symbol);
    
    MarketQuote getUnderlyingQuote(Symbol symbol);
    
    List<OptionQuote> getOptionChain(Symbol underlyingSymbol);
}
