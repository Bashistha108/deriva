package com.deriva.quant.pricing;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class BlackScholesTest {

    private static final double TOLERANCE = 1e-4;

    @Test
    void testCallPrice() {
        // S=100, K=100, T=1, r=0.05, q=0.02, sigma=0.2
        // Expected call price approx 9.2270
        double call = BlackScholes.callPrice(100, 100, 1, 0.05, 0.02, 0.2);
        assertEquals(9.2270, call, TOLERANCE);
    }

    @Test
    void testPutPrice() {
        // S=100, K=100, T=1, r=0.05, q=0.02, sigma=0.2
        // Expected put price approx 6.3301
        double put = BlackScholes.putPrice(100, 100, 1, 0.05, 0.02, 0.2);
        assertEquals(6.3301, put, TOLERANCE);
    }

    @Test
    void testZeroTime() {
        // S=105, K=100 -> intrinsic value 5
        double call = BlackScholes.callPrice(105, 100, 0, 0.05, 0, 0.2);
        assertEquals(5.0, call, TOLERANCE);

        // S=95, K=100 -> intrinsic value 5
        double put = BlackScholes.putPrice(95, 100, 0, 0.05, 0, 0.2);
        assertEquals(5.0, put, TOLERANCE);
    }

    @Test
    void testGreeks() {
        // Just testing they calculate without error and within reasonable bounds
        double delta = BlackScholes.callDelta(100, 100, 1, 0.05, 0.02, 0.2);
        double gamma = BlackScholes.gamma(100, 100, 1, 0.05, 0.02, 0.2);
        double vega = BlackScholes.vega(100, 100, 1, 0.05, 0.02, 0.2);
        double theta = BlackScholes.callTheta(100, 100, 1, 0.05, 0.02, 0.2);
        double rho = BlackScholes.callRho(100, 100, 1, 0.05, 0.02, 0.2);

        assertEquals(0.58685, delta, TOLERANCE);
        assertEquals(0.01895, gamma, TOLERANCE);
        assertEquals(37.9011, vega, 1e-2);
        // Theta can be annualized, so approx -5.089
        assertEquals(-5.0893, theta, 1e-3);
        assertEquals(49.4581, rho, 1e-2);
    }
}
