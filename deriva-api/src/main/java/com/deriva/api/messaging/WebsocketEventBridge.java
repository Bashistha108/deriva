package com.deriva.api.messaging;

import com.deriva.api.dto.TradeDto;
import com.deriva.domain.ledger.events.TradeExecutionEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class WebsocketEventBridge {

    private static final Logger log = LoggerFactory.getLogger(WebsocketEventBridge.class);
    private final SimpMessagingTemplate messagingTemplate;

    public WebsocketEventBridge(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleTradeExecution(TradeExecutionEvent event) {
        log.info("Received TradeExecutionEvent, broadcasting over WS for account: {}", event.accountId());
        
        TradeDto dto = new TradeDto(
                event.eventId(),
                null, // No direct orderId on TradeExecutionEvent
                event.assetSymbol(),
                BigDecimal.valueOf(event.quantity()),
                event.price(),
                event.timestamp()
        );

        // Step 10 & 11: Broadcasting portfolio or trade events
        String destination = "/topic/portfolio/" + event.accountId() + "/trades";
        messagingTemplate.convertAndSend(destination, dto);
    }
}
