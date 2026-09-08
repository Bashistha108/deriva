package com.deriva.quant.pricing;

/**
 * Implied Volatility Solver.
 * 
 * Provides numerical methods (Newton-Raphson and Bisection fallback)
 * to compute the implied volatility of an option given its market price.
 */
public final class ImpliedVolatility {

    private static final int MAX_ITERATIONS = 100;
    private static final double TOLERANCE = 1e-7;
    private static final double MAX_VOLATILITY = 5.0; // 500%
    private static final double MIN_VOLATILITY = 1e-5; // 0.001%

    private ImpliedVolatility() {
        // Utility class
    }

    public static double solveCall(double targetPrice, double s, double k, double t, double r, double q) {
        // Check intrinsic value lower bound
        if (targetPrice < Math.max(0.0, s * Math.exp(-q * t) - k * Math.exp(-r * t))) {
            return Double.NaN; // Price is below theoretical minimum
        }

        // Initial guess based on Brenner and Subrahmanyam (1988) approximation
        double initialGuess = Math.sqrt(2 * Math.PI / t) * (targetPrice / s);
        if (initialGuess <= MIN_VOLATILITY || initialGuess > MAX_VOLATILITY || Double.isNaN(initialGuess)) {
            initialGuess = 0.3; // Fallback to 30%
        }

        return newtonRaphson(true, targetPrice, s, k, t, r, q, initialGuess);
    }

    public static double solvePut(double targetPrice, double s, double k, double t, double r, double q) {
        // Check intrinsic value lower bound
        if (targetPrice < Math.max(0.0, k * Math.exp(-r * t) - s * Math.exp(-q * t))) {
            return Double.NaN; // Price is below theoretical minimum
        }

        double initialGuess = Math.sqrt(2 * Math.PI / t) * (targetPrice / s);
        if (initialGuess <= MIN_VOLATILITY || initialGuess > MAX_VOLATILITY || Double.isNaN(initialGuess)) {
            initialGuess = 0.3;
        }

        return newtonRaphson(false, targetPrice, s, k, t, r, q, initialGuess);
    }

    private static double newtonRaphson(boolean isCall, double targetPrice, double s, double k, double t, double r, double q, double initialGuess) {
        double sigma = initialGuess;

        for (int i = 0; i < MAX_ITERATIONS; i++) {
            double price = isCall ? BlackScholes.callPrice(s, k, t, r, q, sigma) : BlackScholes.putPrice(s, k, t, r, q, sigma);
            double diff = price - targetPrice;
            
            if (Math.abs(diff) < TOLERANCE) {
                return sigma;
            }
            
            double vega = BlackScholes.vega(s, k, t, r, q, sigma);
            
            if (Math.abs(vega) < 1e-12) {
                // Newton-Raphson fails when vega is extremely small, fallback to bisection
                return bisection(isCall, targetPrice, s, k, t, r, q);
            }
            
            sigma = sigma - diff / vega;
            
            if (sigma < MIN_VOLATILITY || sigma > MAX_VOLATILITY) {
                // Newton-Raphson diverges, fallback to bisection
                return bisection(isCall, targetPrice, s, k, t, r, q);
            }
        }
        
        // If NR doesn't converge in MAX_ITERATIONS, fallback
        return bisection(isCall, targetPrice, s, k, t, r, q);
    }

    private static double bisection(boolean isCall, double targetPrice, double s, double k, double t, double r, double q) {
        double low = MIN_VOLATILITY;
        double high = MAX_VOLATILITY;
        
        // Quick check for bounds
        double priceLow = isCall ? BlackScholes.callPrice(s, k, t, r, q, low) : BlackScholes.putPrice(s, k, t, r, q, low);
        if (priceLow >= targetPrice) {
            return low;
        }

        double priceHigh = isCall ? BlackScholes.callPrice(s, k, t, r, q, high) : BlackScholes.putPrice(s, k, t, r, q, high);
        if (priceHigh <= targetPrice) {
            return high;
        }

        for (int i = 0; i < MAX_ITERATIONS; i++) {
            double mid = low + (high - low) / 2.0;
            double priceMid = isCall ? BlackScholes.callPrice(s, k, t, r, q, mid) : BlackScholes.putPrice(s, k, t, r, q, mid);
            
            double diff = priceMid - targetPrice;
            if (Math.abs(diff) < TOLERANCE) {
                return mid;
            }
            
            if (diff > 0) {
                high = mid;
            } else {
                low = mid;
            }
        }
        
        return low + (high - low) / 2.0;
    }
}
