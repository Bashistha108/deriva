package com.deriva.domain.options;

import com.deriva.domain.market.OptionType;
import java.math.BigDecimal;
import java.math.RoundingMode;

public class BlackScholesModel {

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
        theta = theta / 365.0;

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
}
