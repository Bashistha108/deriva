package com.deriva.marketdata;

import com.deriva.domain.common.Symbol;
import com.deriva.domain.marketdata.MarketQuote;
import com.deriva.domain.marketdata.OptionQuote;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.deriva.application.port.out.MarketDataPort;

@Service
public class MarketDataService implements MarketDataPort {

    private final MarketDataProvider provider;
    
    // Simple in-memory cache for option chains
    // In a real application, this would use a more robust caching solution like Redis or Ehcache with TTL
    private final Map<Symbol, List<OptionQuote>> chainCache = new ConcurrentHashMap<>();
    private final Map<Symbol, Long> lastFetchTime = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 60000; // 1 minute

    public MarketDataService(MarketDataProvider provider) {
        this.provider = provider;
    }

    @Override
    public MarketQuote getUnderlyingQuote(Symbol symbol) {
        return provider.getUnderlyingQuote(symbol);
    }

    @Override
    public BigDecimal getLatestPrice(String symbol) {
        MarketQuote quote = provider.getUnderlyingQuote(new Symbol(symbol));
        return quote.last().value();
    }

    public List<OptionQuote> getOptionChain(Symbol symbol) {
        long currentTime = System.currentTimeMillis();
        Long lastFetch = lastFetchTime.get(symbol);
        
        if (lastFetch != null && (currentTime - lastFetch < CACHE_TTL_MS)) {
            return chainCache.get(symbol);
        }

        List<OptionQuote> freshChain = provider.getOptionChain(symbol);
        chainCache.put(symbol, freshChain);
        lastFetchTime.put(symbol, currentTime);
        
        return freshChain;
    }

    public void evictCache(Symbol symbol) {
        chainCache.remove(symbol);
        lastFetchTime.remove(symbol);
    }

    public void evictAllCache() {
        chainCache.clear();
        lastFetchTime.clear();
    }
    
    @Override
    public String getRawOptionChain(String symbol, Long date) {
        return provider.getRawOptionChain(symbol, date);
    }
}
