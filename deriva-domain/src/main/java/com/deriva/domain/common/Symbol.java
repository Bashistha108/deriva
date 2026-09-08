package com.deriva.domain.common;

public record Symbol(String value) {
    public Symbol {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Symbol value cannot be null or blank");
        }
    }
}
