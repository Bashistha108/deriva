package com.deriva.domain.market.values;

public record Price(double value) {
    public static Price of(double price) {
        if (price < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        return new Price(price);
    }
    
    public double toDouble() {
        return value;
    }
}
