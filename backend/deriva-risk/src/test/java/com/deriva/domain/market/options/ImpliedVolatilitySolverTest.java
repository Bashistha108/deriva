package com.deriva.domain.market.options;

import com.deriva.domain.market.OptionType;
import com.deriva.domain.market.values.*;
import com.deriva.domain.options.ImpliedVolatilitySolver;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ImpliedVolatilitySolverTest {

    @ParameterizedTest
    @CsvSource({
            // OptionType, Spot, Strike, Time, Rate, MarketPrice, ExpectedIV
            "CALL, 100.0, 100.0, 0.5, 0.05, 6.8887, 0.200000",
            "PUT,  100.0, 100.0, 0.5, 0.05, 4.4197, 0.200000",
            "CALL, 100.0, 100.0, 0.5, 0.05, 21.9105, 0.750000",
            "PUT,  100.0, 100.0, 0.5, 0.05, 19.4415, 0.750000"
    })
    void shouldSolveImpliedVolatilityFromMarketPrice(
            OptionType type, double S, double K, double T, double r, double marketPrice, String expectedIv) {

        BigDecimal calculatedIv = ImpliedVolatilitySolver.solveIV(type, S, K, T, r, marketPrice);

        // Due to precision loss in the input market price approximation (4 decimals),
        // we scale the result to verify it closely matches the target IV.
        assertEquals(
                new BigDecimal(expectedIv).setScale(4, RoundingMode.HALF_UP),
                calculatedIv.setScale(4, RoundingMode.HALF_UP)
        );
    }

    @Test
    void shouldReturnZeroWhenTimeIsZeroOrNegative() {
        BigDecimal ivZero = ImpliedVolatilitySolver.solveIV(
                OptionType.CALL, 100.0, 100.0, 0.0, 0.05, 10.0
        );
        BigDecimal ivNegative = ImpliedVolatilitySolver.solveIV(
                OptionType.PUT, 100.0, 100.0, -0.5, 0.05, 10.0
        );

        assertEquals(BigDecimal.ZERO, ivZero);
        assertEquals(BigDecimal.ZERO, ivNegative);
    }

    @Test
    void shouldSolveUsingDomainValueObjects() {
        Volatility iv = ImpliedVolatilitySolver.solveIV(
                OptionType.CALL,
                Price.of(100.0),
                Strike.of(100.0),
                DaysToExpiration.ofYears(0.5),
                Percent.ofDecimal(0.05),
                Price.of(6.8887)
        );

        assertEquals(
                new BigDecimal("0.2000").setScale(4, RoundingMode.HALF_UP),
                BigDecimal.valueOf(iv.toDecimal()).setScale(4, RoundingMode.HALF_UP)
        );
    }

}
