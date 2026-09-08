package com.deriva.quant.math;

/**
 * Utility class for Standard Normal Distribution calculations.
 * Contains methods for calculating the Probability Density Function (PDF)
 * and Cumulative Distribution Function (CDF).
 */
public final class NormalDistribution {

    private static final double ONE_OVER_SQRT_TWO_PI = 1.0 / Math.sqrt(2.0 * Math.PI);

    private NormalDistribution() {
        // Utility class
    }

    /**
     * Standard Normal Probability Density Function (PDF).
     * @param x the value to evaluate
     * @return the probability density at x
     */
    public static double pdf(double x) {
        return ONE_OVER_SQRT_TWO_PI * Math.exp(-0.5 * x * x);
    }

    /**
     * Standard Normal Cumulative Distribution Function (CDF). 
     * Uses an approximation by Hastings (1955) which has a max error of 7.5e-8.
     * @param x the value to evaluate
     * @return the cumulative probability up to x
     */
    public static double cdf(double x) {
        // Abramowitz and Stegun approximation
        double l = Math.abs(x);
        double k = 1.0 / (1.0 + 0.2316419 * l);
        double w = 1.0 - ONE_OVER_SQRT_TWO_PI * Math.exp(-0.5 * l * l) * k *
                   (0.319381530 +
                    k * (-0.356563782 +
                    k * (1.781477937 +
                    k * (-1.821255978 +
                    k * 1.330274429))));

        if (x < 0) {
            return 1.0 - w;
        }
        return w;
    }
}
