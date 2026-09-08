package com.deriva.domain.instrument;

import com.deriva.domain.common.Symbol;

public record Underlying(Symbol symbol, String name, String exchange) {
    public Underlying {
        if (symbol == null) {
            throw new IllegalArgumentException("Symbol cannot be null");
        }
    }
}
