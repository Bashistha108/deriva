package com.deriva.domain.market.values;

public record Percent(double value) {
    public static Percent of(double percentage) {
        return new Percent(percentage);
    }
    
    public static Percent ofDecimal(double decimal) {
        return new Percent(decimal * 100.0);
    }

    public double toDecimal() {
        return value / 100.0;
    }
    
    public double doubleValue() {
        return value;
    }
    
    @Override
    public String toString() {
        return String.format("%.2f%%", value);
    }
}
