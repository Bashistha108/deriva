package com.deriva.marketdata;

import com.deriva.domain.common.Symbol;
import com.deriva.domain.marketdata.MarketQuote;
import com.deriva.domain.marketdata.OptionQuote;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

class MockMarketDataProviderTest {

    private MockMarketDataProvider provider;

    @BeforeEach
    void setUp() {
        provider = new MockMarketDataProvider();
    }

    @Test
    void testGetUnderlyingQuote() {
        MarketQuote spyQuote = provider.getUnderlyingQuote(new Symbol("SPY"));
        assertNotNull(spyQuote);
        assertEquals("SPY", spyQuote.symbol().value());
        assertTrue(spyQuote.last().value().doubleValue() > 0);
    }

    @Test
    void testGetOptionChain() {
        List<OptionQuote> chain = provider.getOptionChain(new Symbol("SPY"));
        assertNotNull(chain);
        assertFalse(chain.isEmpty());

        OptionQuote firstQuote = chain.get(0);
        assertNotNull(firstQuote.contract());
        assertTrue(firstQuote.bid().value().doubleValue() >= 0);
        assertTrue(firstQuote.ask().value().doubleValue() >= firstQuote.bid().value().doubleValue());
        assertTrue(firstQuote.delta().doubleValue() != 0);
    }
}
