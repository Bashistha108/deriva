package com.deriva.domain.market.values;

public record Volatility(double decimalValue) {
    public static Volatility ofDecimal(double decimal) {
        return new Volatility(decimal);
    }
    
    public double toDecimal() {
        return decimalValue;
    }
}
