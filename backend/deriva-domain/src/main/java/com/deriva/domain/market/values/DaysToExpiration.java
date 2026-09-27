package com.deriva.domain.market.values;

public record DaysToExpiration(double days) {
    public static final double TRADING_DAYS_PER_YEAR = 256.0;

    public static DaysToExpiration of(double days) {
        return new DaysToExpiration(days);
    }

    public static DaysToExpiration ofYears(double years) {
        return new DaysToExpiration(years * TRADING_DAYS_PER_YEAR);
    }
    
    public double toYears() {
        return days / TRADING_DAYS_PER_YEAR;
    }
    
    public double doubleValue() {
        return days;
    }
}
