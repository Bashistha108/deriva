package com.deriva.marketdata;

import com.deriva.domain.common.Symbol;
import com.deriva.domain.marketdata.MarketQuote;
import com.deriva.domain.marketdata.OptionQuote;
import java.util.List;

public interface MarketDataProvider {
    
    MarketQuote getUnderlyingQuote(Symbol symbol);
    
    List<OptionQuote> getOptionChain(Symbol underlyingSymbol);
    
}
