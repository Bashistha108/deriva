package com.deriva.api.messaging;

import com.deriva.api.dto.MarketQuoteDto;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Random;

// @Component
// @EnableScheduling
public class MarketDataSimulator {

    private final WebsocketBroadcaster broadcaster;
    private final Random random = new Random();
    private final List<String> symbols = List.of("AAPL", "MSFT", "TSLA", "SPY", "QQQ");

    public MarketDataSimulator(WebsocketBroadcaster broadcaster) {
        this.broadcaster = broadcaster;
    }

    @Scheduled(fixedRate = 2000)
    public void simulateMarketData() {
        String symbol = symbols.get(random.nextInt(symbols.size()));
        BigDecimal basePrice = BigDecimal.valueOf(150 + random.nextInt(100));
        BigDecimal spread = BigDecimal.valueOf(random.nextDouble()).max(BigDecimal.valueOf(0.01));

        MarketQuoteDto quote = new MarketQuoteDto(
                symbol,
                basePrice.subtract(spread),
                basePrice.add(spread),
                basePrice,
                Instant.now()
        );

        broadcaster.broadcastQuote(quote);
    }
}
