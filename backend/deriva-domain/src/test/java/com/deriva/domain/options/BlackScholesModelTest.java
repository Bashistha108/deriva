package com.deriva.domain.options;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;

class BlackScholesModelTest {

    @Test
    void testOptionPricingBounds() {
        // Option price should never be negative
        BigDecimal S = new BigDecimal("100.0");
        BigDecimal K = new BigDecimal("100.0");
        BigDecimal T = new BigDecimal("1.0"); // 1 year
        BigDecimal r = new BigDecimal("0.05");
        BigDecimal v = new BigDecimal("0.20");

        BigDecimal callPrice = BlackScholesModel.calculateCallPrice(S, K, T, r, v);
        BigDecimal putPrice = BlackScholesModel.calculatePutPrice(S, K, T, r, v);

        assertThat(callPrice).isGreaterThanOrEqualTo(BigDecimal.ZERO);
        assertThat(putPrice).isGreaterThanOrEqualTo(BigDecimal.ZERO);

        // Call price should be greater than max(0, S - K*e^(-rT))
        double kDiscounted = K.doubleValue() * Math.exp(-r.doubleValue() * T.doubleValue());
        double callLowerBound = Math.max(0, S.doubleValue() - kDiscounted);
        assertThat(callPrice.doubleValue()).isGreaterThanOrEqualTo(callLowerBound);
    }
    
    @Test
    void testCallDeltaBounds() {
        BigDecimal S = new BigDecimal("100.0");
        BigDecimal K = new BigDecimal("100.0");
        BigDecimal T = new BigDecimal("1.0"); 
        BigDecimal r = new BigDecimal("0.05");
        BigDecimal v = new BigDecimal("0.20");

        BigDecimal delta = BlackScholesModel.calculateCallDelta(S, K, T, r, v);
        
        // Call delta must be between 0 and 1
        assertThat(delta.doubleValue()).isBetween(0.0, 1.0);
    }
    
    @Test
    void testPutDeltaBounds() {
        BigDecimal S = new BigDecimal("100.0");
        BigDecimal K = new BigDecimal("100.0");
        BigDecimal T = new BigDecimal("1.0"); 
        BigDecimal r = new BigDecimal("0.05");
        BigDecimal v = new BigDecimal("0.20");

        BigDecimal delta = BlackScholesModel.calculatePutDelta(S, K, T, r, v);
        
        // Put delta must be between -1 and 0
        assertThat(delta.doubleValue()).isBetween(-1.0, 0.0);
    }
}
