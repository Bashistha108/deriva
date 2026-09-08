package com.deriva.domain.marketdata;

import com.deriva.domain.common.Percentage;
import com.deriva.domain.common.Price;
import com.deriva.domain.instrument.OptionContract;
import java.math.BigDecimal;

public record OptionQuote(
        OptionContract contract, 
        Price bid, 
        Price ask, 
        Price last, 
        long volume, 
        Percentage impliedVolatility,
        BigDecimal delta,
        BigDecimal gamma,
        BigDecimal theta,
        BigDecimal vega,
        BigDecimal rho) {
    
    public OptionQuote {
        if (contract == null) throw new IllegalArgumentException("OptionContract cannot be null");
    }
}
