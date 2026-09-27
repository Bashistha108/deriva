package com.deriva.domain.options;

public class NormalDistribution {

    // Standard Normal Probability Density Function
    public static double pdf(double x) {
        return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    }

    // Standard Normal Cumulative Distribution Function using Abramowitz & Stegun approximation
    public static double cdf(double x) {
        if (x < -8.0) return 0.0;
        if (x > 8.0) return 1.0;

        double sum = 0.0, term = x;
        for (int i = 3; sum + term != sum; i += 2) {
            sum = sum + term;
            term = term * x * x / i;
        }
        return 0.5 + sum * pdf(x);
    }
}
