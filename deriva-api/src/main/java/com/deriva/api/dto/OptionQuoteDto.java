package com.deriva.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record OptionQuoteDto(
        String optionSymbol,
        String underlyingSymbol,
        LocalDate expirationDate,
        BigDecimal strikePrice,
        String optionType,
        BigDecimal bid,
        BigDecimal ask,
        BigDecimal impliedVolatility,
        BigDecimal delta,
        BigDecimal gamma,
        BigDecimal theta,
        BigDecimal vega,
        Instant timestamp
) {
}
