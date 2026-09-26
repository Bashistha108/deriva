package com.deriva.api.market;

import com.deriva.application.simulation.MarketDataService;
import com.deriva.domain.market.MarketPriceSnapshot;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/market-data")
public class MarketDataController {

    private final MarketDataService marketDataService;

    public MarketDataController(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @GetMapping("/{instrumentId}/history")
    public ResponseEntity<List<MarketPriceSnapshot>> getHistory(
            @PathVariable Long instrumentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        
        List<MarketPriceSnapshot> history = marketDataService.getHistoricalPrices(instrumentId, start, end);
        return ResponseEntity.ok(history);
    }
}
