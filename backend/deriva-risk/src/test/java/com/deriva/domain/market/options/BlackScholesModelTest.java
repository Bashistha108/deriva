package com.deriva.domain.market.options;


import com.deriva.domain.market.OptionType;
import com.deriva.domain.options.BlackScholesModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

}
