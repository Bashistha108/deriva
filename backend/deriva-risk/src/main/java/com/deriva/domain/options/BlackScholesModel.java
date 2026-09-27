package com.deriva.domain.options;

import com.deriva.domain.market.OptionType;
import com.deriva.domain.market.values.*;
import java.math.BigDecimal;
import java.math.RoundingMode;

public class BlackScholesModel {

    public static BigDecimal calculatePrice(OptionType type, Price S, Strike K, DaysToExpiration T, Percent r, Volatility v) {
        return calculatePrice(type, S.toDouble(), K.toDouble(), T.toYears(), r.toDecimal(), v.toDecimal());
    }

    public static BigDecimal calculatePrice(OptionType type, double S, double K, double T, double r, double v) {
        if (T <= 0.0) {
            return BigDecimal.valueOf(Math.max(0.0, type == OptionType.CALL ? S - K : K - S));
        }

        double d1 = (Math.log(S / K) + (r + v * v / 2.0) * T) / (v * Math.sqrt(T));
        double d2 = d1 - v * Math.sqrt(T);

        double price;
        if (type == OptionType.CALL) {
            price = S * NormalDistribution.cdf(d1) - K * Math.exp(-r * T) * NormalDistribution.cdf(d2);
        } else {
            price = K * Math.exp(-r * T) * NormalDistribution.cdf(-d2) - S * NormalDistribution.cdf(-d1);
        }

        return BigDecimal.valueOf(price).setScale(4, RoundingMode.HALF_UP);
    }

    public static OptionGreeks calculateGreeks(OptionType type, Price S, Strike K, DaysToExpiration T, Percent r, Volatility v) {
        return calculateGreeks(type, S.toDouble(), K.toDouble(), T.toYears(), r.toDecimal(), v.toDecimal());
    }

    public static OptionGreeks calculateGreeks(OptionType type, double S, double K, double T, double r, double v) {
        if (T <= 0.0) {
            return new OptionGreeks(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        double d1 = (Math.log(S / K) + (r + v * v / 2.0) * T) / (v * Math.sqrt(T));
        double d2 = d1 - v * Math.sqrt(T);

        double delta = type == OptionType.CALL ? NormalDistribution.cdf(d1) : NormalDistribution.cdf(d1) - 1.0;
        double gamma = NormalDistribution.pdf(d1) / (S * v * Math.sqrt(T));
        double vega = S * NormalDistribution.pdf(d1) * Math.sqrt(T) / 100.0;
        
        double theta1 = -(S * NormalDistribution.pdf(d1) * v) / (2.0 * Math.sqrt(T));
        double theta;
        if (type == OptionType.CALL) {
            theta = theta1 - r * K * Math.exp(-r * T) * NormalDistribution.cdf(d2);
        } else {
            theta = theta1 + r * K * Math.exp(-r * T) * NormalDistribution.cdf(-d2);
        }
        theta = theta / 256.0;

        double rho;
        if (type == OptionType.CALL) {
            rho = K * T * Math.exp(-r * T) * NormalDistribution.cdf(d2) / 100.0;
        } else {
            rho = -K * T * Math.exp(-r * T) * NormalDistribution.cdf(-d2) / 100.0;
        }

        return new OptionGreeks(
            BigDecimal.valueOf(delta).setScale(6, RoundingMode.HALF_UP),
            BigDecimal.valueOf(gamma).setScale(6, RoundingMode.HALF_UP),
            BigDecimal.valueOf(theta).setScale(6, RoundingMode.HALF_UP),
            BigDecimal.valueOf(vega).setScale(6, RoundingMode.HALF_UP),
            BigDecimal.valueOf(rho).setScale(6, RoundingMode.HALF_UP)
        );
    }

    /**
     * Verifies the Black-Scholes put-call parity relationship.
     *
     * C - P = S - K * e^(-rT)
     *
     * @return difference between the two sides of the parity equation.
     *         Zero means parity holds.
     */
    public static BigDecimal verifyPutCallParity(Price S, Strike K, DaysToExpiration T, Percent r, Volatility v){
        return verifyPutCallParity(S.toDouble(), K.toDouble(), T.toYears(), r.toDecimal(), v.toDecimal());
    }

    public static BigDecimal verifyPutCallParity( double S, double K, double T, double r, double v){
        // 1. Calculate Call and Put prices explicitly (both are required for parity)
        BigDecimal callPrice = calculatePrice(OptionType.CALL, S, K, T, r, v);
        BigDecimal putPrice = calculatePrice(OptionType.PUT, S, K, T, r, v);

        // 2. Calculate the present value of the strike price: K * e^(-rT)
        double presentValueStrike = K * Math.exp(-r * T);

        // 3. Calculate left side of Put-Call Parity: C - P
        BigDecimal leftSide = callPrice.subtract(putPrice);

        // 4. Calculate right side of Put-Call Parity: S - K * e^(-rT)
        BigDecimal rightSide = BigDecimal.valueOf(S).subtract(BigDecimal.valueOf(presentValueStrike));

        // 5. Return the parity difference. If parity holds, this will equal exactly 0.
        return leftSide.subtract(rightSide);
    }
}
