package com.deriva.api.controller;

import com.deriva.api.dto.OptionQuoteDto;
import com.deriva.application.port.out.MarketDataPort;
import com.deriva.domain.common.Symbol;
import com.deriva.domain.marketdata.OptionQuote;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/options")
@Tag(name = "Option Chain", description = "Endpoints for option chain data")
public class OptionChainController {

    private final MarketDataPort marketDataPort;

    public OptionChainController(MarketDataPort marketDataPort) {
        this.marketDataPort = marketDataPort;
    }

    @GetMapping("/{symbol}/chain")
    @Operation(summary = "Get option chain", description = "Retrieves the full option chain quotes for a given underlying symbol.")
    public ResponseEntity<List<OptionQuoteDto>> getOptionChain(@PathVariable String symbol) {
        List<OptionQuote> chain = marketDataPort.getOptionChain(new Symbol(symbol));
        if (chain == null || chain.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<OptionQuoteDto> response = chain.stream()
                .map(quote -> new OptionQuoteDto(
                        quote.contract().underlying().symbol().value(),
                        symbol,
                        quote.contract().expiration().date(),
                        quote.contract().strike().value(),
                        quote.contract().type().name(),
                        quote.bid().value(),
                        quote.ask().value(),
                        java.math.BigDecimal.valueOf(quote.impliedVolatility().decimalValue()),
                        quote.delta(),
                        quote.gamma(),
                        quote.theta(),
                        quote.vega(),
                        java.time.Instant.now()
                ))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{symbol}/raw")
    @Operation(summary = "Get raw option chain", description = "Retrieves the raw JSON option chain data directly from the provider.")
    public ResponseEntity<String> getRawOptionChain(
            @PathVariable String symbol,
            @RequestParam(required = false) Long date) {
        try {
            String rawJson = marketDataPort.getRawOptionChain(symbol, date);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(rawJson);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
}
