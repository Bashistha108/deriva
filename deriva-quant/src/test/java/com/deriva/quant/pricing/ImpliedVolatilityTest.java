package com.deriva.quant.pricing;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ImpliedVolatilityTest {

    private static final double TOLERANCE = 1e-5;

    @Test
    void testSolveCall() {
        double s = 100;
        double k = 100;
        double t = 1;
        double r = 0.05;
        double q = 0.02;
        double sigma = 0.2;
        
        double callPrice = BlackScholes.callPrice(s, k, t, r, q, sigma);
        
        double iv = ImpliedVolatility.solveCall(callPrice, s, k, t, r, q);
        
        assertEquals(sigma, iv, TOLERANCE);
    }

    @Test
    void testSolvePut() {
        double s = 100;
        double k = 100;
        double t = 1;
        double r = 0.05;
        double q = 0.02;
        double sigma = 0.2;
        
        double putPrice = BlackScholes.putPrice(s, k, t, r, q, sigma);
        
        double iv = ImpliedVolatility.solvePut(putPrice, s, k, t, r, q);
        
        assertEquals(sigma, iv, TOLERANCE);
    }
    
    @Test
    void testDeepOTM() {
        double s = 100;
        double k = 150;
        double t = 0.1;
        double r = 0.05;
        double q = 0.0;
        double sigma = 0.5;
        
        double callPrice = BlackScholes.callPrice(s, k, t, r, q, sigma);
        double iv = ImpliedVolatility.solveCall(callPrice, s, k, t, r, q);
        
        assertEquals(sigma, iv, TOLERANCE);
    }
}
