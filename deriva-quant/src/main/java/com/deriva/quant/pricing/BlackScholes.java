package com.deriva.quant.pricing;

import com.deriva.quant.math.NormalDistribution;

/**
 * Utility class for Black-Scholes-Merton option pricing and Greeks calculation.
 * 
 * Uses primitive doubles for performance as required by the financial engine.
 */
public final class BlackScholes {

    private BlackScholes() {
        // Utility class
    }

    private static double d1(double s, double k, double t, double r, double q, double sigma) {
        return (Math.log(s / k) + (r - q + 0.5 * sigma * sigma) * t) / (sigma * Math.sqrt(t));
    }

    private static double d2(double d1, double t, double sigma) {
        return d1 - sigma * Math.sqrt(t);
    }

    /**
     * Calculates the price of a European Call option.
     * 
     * @param s     Spot price of the underlying asset
     * @param k     Strike price of the option
     * @param t     Time to expiration in years
     * @param r     Risk-free interest rate (annualized)
     * @param q     Continuous dividend yield (annualized)
     * @param sigma Implied volatility (annualized)
     * @return The theoretical price of the call option
     */
    public static double callPrice(double s, double k, double t, double r, double q, double sigma) {
        if (t <= 0.0) {
            return Math.max(0.0, s - k);
        }
        if (sigma <= 0.0) {
            return Math.max(0.0, s * Math.exp(-q * t) - k * Math.exp(-r * t));
        }
        double d1 = d1(s, k, t, r, q, sigma);
        double d2 = d2(d1, t, sigma);
        return s * Math.exp(-q * t) * NormalDistribution.cdf(d1) - k * Math.exp(-r * t) * NormalDistribution.cdf(d2);
    }

    /**
     * Calculates the price of a European Put option.
     * 
     * @param s     Spot price of the underlying asset
     * @param k     Strike price of the option
     * @param t     Time to expiration in years
     * @param r     Risk-free interest rate (annualized)
     * @param q     Continuous dividend yield (annualized)
     * @param sigma Implied volatility (annualized)
     * @return The theoretical price of the put option
     */
    public static double putPrice(double s, double k, double t, double r, double q, double sigma) {
        if (t <= 0.0) {
            return Math.max(0.0, k - s);
        }
        if (sigma <= 0.0) {
            return Math.max(0.0, k * Math.exp(-r * t) - s * Math.exp(-q * t));
        }
        double d1 = d1(s, k, t, r, q, sigma);
        double d2 = d2(d1, t, sigma);
        return k * Math.exp(-r * t) * NormalDistribution.cdf(-d2) - s * Math.exp(-q * t) * NormalDistribution.cdf(-d1);
    }

    /**
     * Calculates Call Delta.
     */
    public static double callDelta(double s, double k, double t, double r, double q, double sigma) {
        if (t <= 0.0) return s >= k ? 1.0 : 0.0;
        if (sigma <= 0.0) return s > k * Math.exp(-(r-q)*t) ? Math.exp(-q*t) : 0.0;
        double d1 = d1(s, k, t, r, q, sigma);
        return Math.exp(-q * t) * NormalDistribution.cdf(d1);
    }

    /**
     * Calculates Put Delta.
     */
    public static double putDelta(double s, double k, double t, double r, double q, double sigma) {
        if (t <= 0.0) return s <= k ? -1.0 : 0.0;
        if (sigma <= 0.0) return s < k * Math.exp(-(r-q)*t) ? -Math.exp(-q*t) : 0.0;
        double d1 = d1(s, k, t, r, q, sigma);
        return Math.exp(-q * t) * (NormalDistribution.cdf(d1) - 1.0);
    }

    /**
     * Calculates Gamma (same for Call and Put).
     */
    public static double gamma(double s, double k, double t, double r, double q, double sigma) {
        if (t <= 0.0 || sigma <= 0.0) return 0.0;
        double d1 = d1(s, k, t, r, q, sigma);
        return (Math.exp(-q * t) * NormalDistribution.pdf(d1)) / (s * sigma * Math.sqrt(t));
    }

    /**
     * Calculates Vega (same for Call and Put).
     * Vega is expressed as change in price per 100% change in volatility, 
     * sometimes divided by 100 to represent change per 1% in practice, but keeping standard theoretical value here.
     */
    public static double vega(double s, double k, double t, double r, double q, double sigma) {
        if (t <= 0.0 || sigma <= 0.0) return 0.0;
        double d1 = d1(s, k, t, r, q, sigma);
        return s * Math.exp(-q * t) * NormalDistribution.pdf(d1) * Math.sqrt(t);
    }

    /**
     * Calculates Call Theta.
     * Typically, this is annualized theta. 
     * To get daily theta, one divides by 365.
     */
    public static double callTheta(double s, double k, double t, double r, double q, double sigma) {
        if (t <= 0.0 || sigma <= 0.0) return 0.0;
        double d1 = d1(s, k, t, r, q, sigma);
        double d2 = d2(d1, t, sigma);
        double p1 = - (s * Math.exp(-q * t) * NormalDistribution.pdf(d1) * sigma) / (2 * Math.sqrt(t));
        double p2 = r * k * Math.exp(-r * t) * NormalDistribution.cdf(d2);
        double p3 = q * s * Math.exp(-q * t) * NormalDistribution.cdf(d1);
        return p1 - p2 + p3;
    }

    /**
     * Calculates Put Theta.
     */
    public static double putTheta(double s, double k, double t, double r, double q, double sigma) {
        if (t <= 0.0 || sigma <= 0.0) return 0.0;
        double d1 = d1(s, k, t, r, q, sigma);
        double d2 = d2(d1, t, sigma);
        double p1 = - (s * Math.exp(-q * t) * NormalDistribution.pdf(d1) * sigma) / (2 * Math.sqrt(t));
        double p2 = r * k * Math.exp(-r * t) * NormalDistribution.cdf(-d2);
        double p3 = q * s * Math.exp(-q * t) * NormalDistribution.cdf(-d1);
        return p1 + p2 - p3;
    }

    /**
     * Calculates Call Rho.
     */
    public static double callRho(double s, double k, double t, double r, double q, double sigma) {
        if (t <= 0.0 || sigma <= 0.0) return 0.0;
        double d1 = d1(s, k, t, r, q, sigma);
        double d2 = d2(d1, t, sigma);
        return k * t * Math.exp(-r * t) * NormalDistribution.cdf(d2);
    }

    /**
     * Calculates Put Rho.
     */
    public static double putRho(double s, double k, double t, double r, double q, double sigma) {
        if (t <= 0.0 || sigma <= 0.0) return 0.0;
        double d1 = d1(s, k, t, r, q, sigma);
        double d2 = d2(d1, t, sigma);
        return -k * t * Math.exp(-r * t) * NormalDistribution.cdf(-d2);
    }
}
