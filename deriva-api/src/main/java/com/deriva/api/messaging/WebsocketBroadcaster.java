package com.deriva.api.messaging;

import com.deriva.api.dto.MarketQuoteDto;
import com.deriva.api.dto.OptionQuoteDto;
import com.deriva.api.dto.OrderResponseDto;
import com.deriva.api.dto.PortfolioSnapshotDto;
import com.deriva.api.dto.RiskMetricsDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class WebsocketBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(WebsocketBroadcaster.class);

    private final SimpMessagingTemplate messagingTemplate;

    public WebsocketBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Step 4 & 9: Quote topics and market-data broadcasting
    public void broadcastQuote(MarketQuoteDto quote) {
        String destination = "/topic/quotes/" + quote.symbol();
        log.trace("Broadcasting quote to {}: {}", destination, quote);
        messagingTemplate.convertAndSend(destination, quote);
    }

    // Step 5: Options-chain topics
    public void broadcastOptionQuote(OptionQuoteDto quote) {
        String destination = "/topic/option-chain/" + quote.underlyingSymbol();
        log.trace("Broadcasting option quote to {}: {}", destination, quote);
        messagingTemplate.convertAndSend(destination, quote);
    }

    // Step 6 & 10: Portfolio topics and P/L broadcasting
    public void broadcastPortfolioSnapshot(PortfolioSnapshotDto snapshot) {
        String destination = "/topic/portfolio/" + snapshot.accountId();
        log.trace("Broadcasting portfolio snapshot to {}: {}", destination, snapshot);
        messagingTemplate.convertAndSend(destination, snapshot);
    }

    // Step 7 & 11: Order-status topics and broadcasting
    public void broadcastOrderStatus(OrderResponseDto order) {
        String destination = "/topic/orders/" + order.accountId();
        log.trace("Broadcasting order status to {}: {}", destination, order);
        messagingTemplate.convertAndSend(destination, order);
    }

    // Step 8: Risk topics
    public void broadcastRiskMetrics(RiskMetricsDto metrics) {
        String destination = "/topic/risk/" + metrics.accountId();
        log.trace("Broadcasting risk metrics to {}: {}", destination, metrics);
        messagingTemplate.convertAndSend(destination, metrics);
    }
}
