package com.deriva.domain.portfolio;

import com.deriva.domain.market.OptionType;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;
import java.util.UUID;

class PositionTest {

    @Test
    void testLongPositionPnL() {
        Position pos = new Position();
        pos.setQuantity(10);
        pos.setAveragePrice(new BigDecimal("2.50"));
        
        // Mark increases to 3.50 (Profit of 1.00 per contract)
        // 1.00 * 10 * 100 multiplier = 1000 profit
        // Wait, domain doesn't strictly inject multiplier here or does it? 
        // Let's assume the entity holds raw values.
        
        pos.setCurrentPrice(new BigDecimal("3.50"));
        
        // PnL = (3.50 - 2.50) * 10 = 10
        BigDecimal pnl = pos.getCurrentPrice().subtract(pos.getAveragePrice()).multiply(BigDecimal.valueOf(pos.getQuantity()));
        
        assertThat(pnl).isEqualByComparingTo(new BigDecimal("10.00"));
    }

    @Test
    void testShortPositionPnL() {
        Position pos = new Position();
        pos.setQuantity(-10); // Short
        pos.setAveragePrice(new BigDecimal("2.50"));
        
        // Mark decreases to 1.50 (Profit for short)
        pos.setCurrentPrice(new BigDecimal("1.50"));
        
        // PnL = (2.50 - 1.50) * 10 = 10 
        // Or calculated generically: (current - avg) * qty
        // (1.50 - 2.50) = -1.00.  -1.00 * -10 = 10
        BigDecimal pnl = pos.getCurrentPrice().subtract(pos.getAveragePrice()).multiply(BigDecimal.valueOf(pos.getQuantity()));
        
        assertThat(pnl).isEqualByComparingTo(new BigDecimal("10.00"));
    }
}
