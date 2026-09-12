package com.deriva.api.messaging;

import com.deriva.api.dto.MarketQuoteDto;
import com.deriva.domain.common.Symbol;
import com.deriva.domain.marketdata.MarketQuote;
import com.deriva.marketdata.MarketDataProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@EnableScheduling
public class RealMarketDataStreamer {

    private static final Logger log = LoggerFactory.getLogger(RealMarketDataStreamer.class);
    
    private final WebsocketBroadcaster broadcaster;
    private final MarketDataProvider marketDataProvider;
    private final List<String> symbols = List.of("AAPL", "MSFT", "TSLA", "SPY", "QQQ");

    public RealMarketDataStreamer(WebsocketBroadcaster broadcaster, MarketDataProvider marketDataProvider) {
        this.broadcaster = broadcaster;
        this.marketDataProvider = marketDataProvider;
    }

    @Scheduled(fixedRate = 10000)
    public void streamRealMarketData() {
        for (String sym : symbols) {
            try {
                Symbol symbol = new Symbol(sym);
                MarketQuote quote = marketDataProvider.getUnderlyingQuote(symbol);
                
                MarketQuoteDto dto = new MarketQuoteDto(
                        sym,
                        quote.bid().value(),
                        quote.ask().value(),
                        quote.last().value(),
                        Instant.now()
                );

                broadcaster.broadcastQuote(dto);
            } catch (Exception e) {
                log.warn("Failed to fetch real market data for symbol {}: {}", sym, e.getMessage());
            }
        }
    }
}
