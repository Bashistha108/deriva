package com.deriva.domain.market.values;

public record Strike(double value) {
    public static Strike of(double strike) {
        if (strike <= 0) {
            throw new IllegalArgumentException("Strike must be positive");
        }
        return new Strike(strike);
    }
    
    public double toDouble() {
        return value;
    }
}
