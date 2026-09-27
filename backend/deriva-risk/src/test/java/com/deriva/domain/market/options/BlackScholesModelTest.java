package com.deriva.domain.market.options;

import com.deriva.domain.market.OptionType;
import com.deriva.domain.options.BlackScholesModel;
import com.deriva.domain.options.OptionGreeks;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import com.deriva.domain.market.values.*;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class BlackScholesModelTest {

    Price S;
    Strike K;
    DaysToExpiration T;
    Percent r;
    Volatility v;

    @BeforeEach
    void setUp() {
        S = Price.of(100.0);
        K = Strike.of(110.0);
        T = DaysToExpiration.ofYears(0.1171875); // DTE - 30 & 256 Total trading days
        r = Percent.ofDecimal(0.05);
        v = Volatility.ofDecimal(0.25);

    }

    @Test
    void testVerifyPutCallParity() {
        BigDecimal result = BlackScholesModel.verifyPutCallParity(
                S, K, T, r, v
        );

        assertEquals(
                0.0,
                result.doubleValue(),
                0.0001
        );
    }

    @Test
    void testCalculateCallPriceATM() {
        BigDecimal result = BlackScholesModel.calculatePrice(
                OptionType.CALL, S, Strike.of(100.0), T, r, v
        );

        assertEquals(
                3.7034,
                result.doubleValue(),
                0.0001
        );
    }

    @Test
    void testCalculatePutPriceATM() {
        BigDecimal result = BlackScholesModel.calculatePrice(
                OptionType.PUT, S, Strike.of(100.0), T, r, v
        );

        assertEquals(
                3.1191,
                result.doubleValue(),
                0.0001
        );
    }

    @Test
    void shouldCalculateCallPriceITM() {

        BigDecimal result = BlackScholesModel.calculatePrice(
                OptionType.CALL, S, Strike.of(90.0), T, r, v
        );

        assertEquals(new BigDecimal("10.8945"), result);
    }

    @Test
    void shouldCalculateCallPriceOTM() {

        BigDecimal result = BlackScholesModel.calculatePrice(
                OptionType.CALL, S, Strike.of(110.0), T, r, v
        );

        assertEquals(new BigDecimal("0.6832"), result);
    }

    @Test
    void shouldCalculatePutPriceITM() {

        BigDecimal result = BlackScholesModel.calculatePrice(
                OptionType.PUT, S, Strike.of(110.0), T, r, v
        );

        assertEquals(new BigDecimal("10.0406"), result);
    }

    @Test
    void shouldCalculatePutPriceOTM() {

        BigDecimal result = BlackScholesModel.calculatePrice(
                OptionType.PUT, S, Strike.of(90.0), T, r, v
        );

        assertEquals(new BigDecimal("0.3687"), result);
    }

    @Test
    void shouldReturnIntrinsicValueForExpiredCall() {

        // OTM
        BigDecimal result = BlackScholesModel.calculatePrice(
                OptionType.CALL, S, Strike.of(110.0), DaysToExpiration.of(0), r, v
        );

        assertEquals(new BigDecimal("0.0"), result);

        // ATM
        BigDecimal result1 = BlackScholesModel.calculatePrice(
                OptionType.CALL, S, Strike.of(100.0), DaysToExpiration.of(0), r, v
        );

        assertEquals(new BigDecimal("0.0"), result1);

        // ITM
        BigDecimal result2 = BlackScholesModel.calculatePrice(
                OptionType.CALL, S, Strike.of(90.0), DaysToExpiration.of(0), r, v
        );

        assertEquals(new BigDecimal("10.0"), result2);

    }

    @Test
    void shouldReturnIntrinsicValueForExpiredPut() {

        // OTM
        BigDecimal result = BlackScholesModel.calculatePrice(
                OptionType.PUT, S, Strike.of(90.0), DaysToExpiration.of(0), r, v
        );

        assertEquals(new BigDecimal("0.0"), result);

        // ATM
        BigDecimal result1 = BlackScholesModel.calculatePrice(
                OptionType.PUT, S, Strike.of(100.0), DaysToExpiration.of(0), r, v
        );

        assertEquals(new BigDecimal("0.0"), result1);

        // ITM
        BigDecimal result2 = BlackScholesModel.calculatePrice(
                OptionType.PUT, S, Strike.of(110.0), DaysToExpiration.of(0), r, v
        );

        assertEquals(new BigDecimal("10.0"), result2);
    }

    @Test
    void shouldReturnIntrinsicValueWhenTimeIsNegative() {


        // Call
        BigDecimal result = BlackScholesModel.calculatePrice(
                OptionType.CALL, S, K, DaysToExpiration.of(-1), r, v
        );

        assertEquals(new BigDecimal("0.0"), result);

        // Put
        BigDecimal result2 = BlackScholesModel.calculatePrice(
                OptionType.PUT, S, K, DaysToExpiration.of(-1), r, v
        );

        assertEquals(new BigDecimal("10.0"), result2);
    }

    @Test
    void shouldRoundPriceToFourDecimalPlaces() {

        BigDecimal result = BlackScholesModel.calculatePrice(
                OptionType.CALL, S, K, T, r, v
        );

        assertEquals(4, result.scale());
    }

    @Test
    void shouldIncreaseCallPriceWhenVolatilityIncreases() {
        BigDecimal lowVolatilityPrice = BlackScholesModel.calculatePrice(
                OptionType.CALL, S, K, T, r, Volatility.ofDecimal(0.20)
        );

        BigDecimal highVolatilityPrice = BlackScholesModel.calculatePrice(
                OptionType.CALL, S, K, T, r, Volatility.ofDecimal(0.30)
        );

        assertTrue(highVolatilityPrice.compareTo(lowVolatilityPrice) > 0);
    }

    @Test
    void shouldIncreasePutPriceWhenVolatilityIncreases() {
        BigDecimal lowVolatilityPrice = BlackScholesModel.calculatePrice(
                OptionType.PUT, S, K, T, r, Volatility.ofDecimal(0.20)
        );

        BigDecimal highVolatilityPrice = BlackScholesModel.calculatePrice(
                OptionType.PUT, S, K, T, r, Volatility.ofDecimal(0.30)
        );

        assertTrue(highVolatilityPrice.compareTo(lowVolatilityPrice) > 0);
    }

    @Test
    void shouldCalculateCallDelta() {

        // OTM
        OptionGreeks result = BlackScholesModel.calculateGreeks(
                OptionType.CALL, S, K, T, r, v
        );

        assertEquals(0.158071, result.getDelta().doubleValue(), 0.000001);

        // ATM
        OptionGreeks result1 = BlackScholesModel.calculateGreeks(
                OptionType.CALL, S, Strike.of(100.0), T, r, v
        );

        assertEquals(0.544293, result1.getDelta().doubleValue(), 0.000001);

        // ITM
        OptionGreeks result2 = BlackScholesModel.calculateGreeks(
                OptionType.CALL, S, Strike.of(90.0), T, r, v
        );

        assertEquals(0.910261, result2.getDelta().doubleValue(), 0.000001);
    }

    @Test
    void shouldCalculatePutDelta() {

        // OTM
        OptionGreeks result = BlackScholesModel.calculateGreeks(
                OptionType.PUT, S, Strike.of(90.0), T, r, v
        );

        // ATM
        OptionGreeks result1 = BlackScholesModel.calculateGreeks(
                OptionType.PUT, S, Strike.of(100.0), T, r, v
        );

        // ITM
        OptionGreeks result2 = BlackScholesModel.calculateGreeks(
                OptionType.PUT, S, K, T, r, v
        );

        assertEquals(new BigDecimal("-0.841929"), result2.getDelta());
        assertEquals(new BigDecimal("-0.455707"), result1.getDelta());
        assertEquals(new BigDecimal("-0.089739"), result.getDelta());
    }

    @Test
    void shouldCalculateCallDeltaWhenSpotChanges() {

        // OTM (S=90, K=100)
        OptionGreeks result = BlackScholesModel.calculateGreeks(
                OptionType.CALL, Price.of(90.0), Strike.of(100.0), T, r, v
        );
        assertEquals(new BigDecimal("0.131388"), result.getDelta());

        // ATM (S=100, K=100)
        OptionGreeks result1 = BlackScholesModel.calculateGreeks(
                OptionType.CALL, Price.of(100.0), Strike.of(100.0), T, r, v
        );
        assertEquals(new BigDecimal("0.544293"), result1.getDelta());

        // ITM (S=110, K=100)
        OptionGreeks result2 = BlackScholesModel.calculateGreeks(
                OptionType.CALL, Price.of(110.0), Strike.of(100.0), T, r, v
        );
        assertEquals(new BigDecimal("0.889699"), result2.getDelta());
    }

    @Test
    void shouldCalculatePutDeltaWhenSpotChanges() {

        // OTM (S=110, K=100)
        OptionGreeks result = BlackScholesModel.calculateGreeks(
                OptionType.PUT, Price.of(110.0), Strike.of(100.0), T, r, v
        );
        assertEquals(new BigDecimal("-0.110301"), result.getDelta());

        // ATM (S=100, K=100)
        OptionGreeks result1 = BlackScholesModel.calculateGreeks(
                OptionType.PUT, Price.of(100.0), Strike.of(100.0), T, r, v
        );
        assertEquals(new BigDecimal("-0.455707"), result1.getDelta());

        // ITM (S=90, K=100)
        OptionGreeks result2 = BlackScholesModel.calculateGreeks(
                OptionType.PUT, Price.of(90.0), Strike.of(100.0), T, r, v
        );
        assertEquals(new BigDecimal("-0.868612"), result2.getDelta());
    }

    @Test
    void shouldCalculateGammaAndVerifyPutCallParity() {
        assertGamma(90.0, "0.027667");  // OTM Call / ITM Put
        assertGamma(100.0, "0.046328"); // ATM
        assertGamma(110.0, "0.020013"); // ITM Call / OTM Put
    }

    private void assertGamma(double spot, String expectedGammaValue) {
        BigDecimal expectedGamma = new BigDecimal(expectedGammaValue);

        OptionGreeks callGreeks = BlackScholesModel.calculateGreeks(
                OptionType.CALL, Price.of(spot), Strike.of(100.0), T, r, v
        );

        OptionGreeks putGreeks = BlackScholesModel.calculateGreeks(
                OptionType.PUT, Price.of(spot), Strike.of(100.0), T, r, v
        );

        // Verify Call Gamma matches mathematical expectation
        assertEquals(expectedGamma, callGreeks.getGamma());

        // Verify Put Gamma matches Call Gamma (Gamma Put-Call Parity)
        assertEquals(callGreeks.getGamma(), putGreeks.getGamma());
    }

    @ParameterizedTest
    @CsvSource({
            "CALL, 0.082633, -0.037384, 0.017723",
            "PUT,  0.082633, -0.016025, -0.110430"
    })
    void shouldCalculateVegaThetaRho(OptionType type, String expectedVega, String expectedTheta, String expectedRho) {
        OptionGreeks greeks = BlackScholesModel.calculateGreeks(type, S, K, T, r, v);

        assertEquals(new BigDecimal(expectedVega), greeks.getVega());

        assertEquals(new BigDecimal(expectedTheta), greeks.getTheta());

        assertEquals(new BigDecimal(expectedRho), greeks.getRho());
    }

    @Test
    void shouldHaveHigherVegaWhenVolatilityIncreases() {
        BigDecimal baseVega = BlackScholesModel.calculateGreeks(OptionType.CALL, S, K, T, r, v).getVega();

        Volatility higherV = Volatility.ofDecimal(0.30);
        BigDecimal higherVega = BlackScholesModel.calculateGreeks(OptionType.CALL, S, K, T, r, higherV).getVega();

        assertTrue(higherVega.compareTo(baseVega) > 0);
    }

    @Test
    void shouldHaveHigherCallRhoWhenInterestRateIncreases() {
        BigDecimal baseRho = BlackScholesModel.calculateGreeks(OptionType.CALL, S, K, T, r, v).getRho();

        Percent higherR = Percent.ofDecimal(0.10);
        BigDecimal higherRho = BlackScholesModel.calculateGreeks(OptionType.CALL, S, K, T, higherR, v).getRho();

        assertTrue(higherRho.compareTo(baseRho) > 0);
    }

    @Test
    void shouldHaveLowerPutRhoWhenInterestRateIncreases() {
        BigDecimal baseRho = BlackScholesModel.calculateGreeks(OptionType.PUT, S, K, T, r, v).getRho();

        Percent higherR = Percent.ofDecimal(0.10);
        BigDecimal newRho = BlackScholesModel.calculateGreeks(OptionType.PUT, S, K, T, higherR, v).getRho();

        // Put Rho is negative. An interest rate increase lowers its absolute magnitude.
        assertTrue(newRho.abs().compareTo(baseRho.abs()) < 0);
    }

}
