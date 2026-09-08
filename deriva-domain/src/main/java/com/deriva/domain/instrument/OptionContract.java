package com.deriva.domain.instrument;

import com.deriva.domain.common.Price;

public record OptionContract(
        Underlying underlying, 
        OptionType type, 
        Price strike, 
        OptionExpiration expiration, 
        int contractSize) {
    
    public OptionContract {
        if (underlying == null) throw new IllegalArgumentException("Underlying cannot be null");
        if (type == null) throw new IllegalArgumentException("OptionType cannot be null");
        if (strike == null) throw new IllegalArgumentException("Strike cannot be null");
        if (expiration == null) throw new IllegalArgumentException("Expiration cannot be null");
        if (contractSize <= 0) throw new IllegalArgumentException("Contract size must be positive");
    }
}
