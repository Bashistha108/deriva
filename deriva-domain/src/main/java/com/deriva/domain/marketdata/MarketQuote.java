package com.deriva.domain.marketdata;

import com.deriva.domain.common.Price;
import com.deriva.domain.common.Symbol;

public record MarketQuote(Symbol symbol, Price bid, Price ask, Price last, long volume) {
    public MarketQuote {
        if (symbol == null) throw new IllegalArgumentException("Symbol cannot be null");
    }
}
