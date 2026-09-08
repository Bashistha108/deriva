package com.deriva.domain.instrument;

import java.time.LocalDate;

public record OptionExpiration(LocalDate date) {
    public OptionExpiration {
        if (date == null) {
            throw new IllegalArgumentException("Expiration date cannot be null");
        }
    }
}
