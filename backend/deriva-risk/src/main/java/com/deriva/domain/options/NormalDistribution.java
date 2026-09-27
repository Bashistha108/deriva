package com.deriva.domain.options;

public class NormalDistribution {

    // Standard Normal Probability Density Function
    public static double pdf(double x) {
        return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    }

    // Standard Normal Cumulative Distribution Function using Abramowitz & Stegun approximation
    public static double cdf(double x) {
        // Abramowitz & Stegun 26.2.17, accurate to ~7.5e-8
        final double a1 =  0.254829592;
        final double a2 = -0.284496736;
        final double a3 =  1.421413741;
        final double a4 = -1.453152027;
        final double a5 =  1.061405429;
        final double p  =  0.3275911;

        int sign = (x < 0) ? -1 : 1;
        double ax = Math.abs(x) / Math.sqrt(2.0);
        double t = 1.0 / (1.0 + p * ax);
        double y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);

        return 0.5 * (1.0 + sign * y);
    }
}
