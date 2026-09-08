package com.deriva.api.controller;

import com.deriva.api.dto.MarketQuoteDto;
import com.deriva.application.port.out.MarketDataPort;
import com.deriva.domain.common.Symbol;
import com.deriva.domain.marketdata.MarketQuote;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/market-data")
@Tag(name = "Market Data", description = "Endpoints for retrieving real-time market data")
public class MarketDataController {

    private final MarketDataPort marketDataPort;

    public MarketDataController(MarketDataPort marketDataPort) {
        this.marketDataPort = marketDataPort;
    }

    @GetMapping("/quotes/{symbol}")
    @Operation(summary = "Get underlying quote", description = "Retrieves the latest market quote for a given underlying symbol.")
    public ResponseEntity<MarketQuoteDto> getQuote(@PathVariable String symbol) {
        MarketQuote quote = marketDataPort.getUnderlyingQuote(new Symbol(symbol));
        if (quote == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new MarketQuoteDto(
                quote.symbol().value(),
                quote.bid().value(),
                quote.ask().value(),
                quote.last().value(),
                java.time.Instant.now()
        ));
    }
}
