package com.deriva.domain.options;

import com.deriva.domain.market.OptionType;
import com.deriva.domain.market.values.*;
import java.math.BigDecimal;
import java.math.RoundingMode;

public class ImpliedVolatilitySolver {

    private static final double MAX_ITERATIONS = 100;
    private static final double TOLERANCE = 1e-5;

    public static Volatility solveIV(OptionType type, Price S, Strike K, DaysToExpiration T, Percent r, Price marketPrice) {
        BigDecimal iv = solveIV(type, S.toDouble(), K.toDouble(), T.toYears(), r.toDecimal(), marketPrice.toDouble());
        return Volatility.ofDecimal(iv.doubleValue());
    }

    public static BigDecimal solveIV(OptionType type, double S, double K, double T, double r, double marketPrice) {
        if (T <= 0.0) {
            return BigDecimal.ZERO;
        }

        double v = 0.5; // Initial guess (50%)

        for (int i = 0; i < MAX_ITERATIONS; i++) {
            double price = BlackScholesModel.calculatePrice(type, S, K, T, r, v).doubleValue();
            double diff = price - marketPrice;

            if (Math.abs(diff) < TOLERANCE) {
                return BigDecimal.valueOf(v).setScale(6, RoundingMode.HALF_UP);
            }

            double d1 = (Math.log(S / K) + (r + v * v / 2.0) * T) / (v * Math.sqrt(T));
            double vega = S * NormalDistribution.pdf(d1) * Math.sqrt(T);

            if (vega == 0.0) {
                break; // Prevent division by zero
            }

            v = v - diff / vega;

            if (v <= 0.0) {
                v = 0.001; // IV cannot be negative
            }
        }

        return BigDecimal.valueOf(v).setScale(6, RoundingMode.HALF_UP);
    }
}
