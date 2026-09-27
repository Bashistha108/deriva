package com.deriva.domain.market.options;

import com.deriva.domain.options.NormalDistribution;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class NormalDistributionTest {

    private static final double DELTA = 1e-7; // Abramowitz & Stegun accuracy is ~7.5e-8

    @ParameterizedTest
    @CsvSource({
            "0.0, 0.398942280",
            "1.0, 0.241970724",
            "-1.0, 0.241970724",
            "2.0, 0.053990966",
            "-2.0, 0.053990966"
    })
    void shouldCalculatePdf(double x, double expectedPdf) {
        assertEquals(expectedPdf, NormalDistribution.pdf(x), DELTA);
    }

    @ParameterizedTest
    @CsvSource({
            "0.0, 0.5000000",
            "1.0, 0.8413447",
            "-1.0, 0.1586553",
            "1.96, 0.9750021",
            "-1.96, 0.0249979",
            "2.58, 0.9950599",
            "-2.58, 0.0049401"
    })
    void shouldCalculateCdf(double x, double expectedCdf) {
        assertEquals(expectedCdf, NormalDistribution.cdf(x), DELTA);
    }

    @Test
    void cdfShouldApproachOneForLargePositiveValues() {
        assertEquals(1.0, NormalDistribution.cdf(10.0), DELTA);
        assertEquals(1.0, NormalDistribution.cdf(20.0), DELTA);
    }

    @Test
    void cdfShouldApproachZeroForLargeNegativeValues() {
        assertEquals(0.0, NormalDistribution.cdf(-10.0), DELTA);
        assertEquals(0.0, NormalDistribution.cdf(-20.0), DELTA);
    }

}
