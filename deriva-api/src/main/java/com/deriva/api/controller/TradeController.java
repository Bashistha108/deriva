package com.deriva.api.controller;

import com.deriva.api.dto.TradeDto;
import com.deriva.application.port.out.LedgerPort;
import com.deriva.domain.ledger.events.LedgerEvent;
import com.deriva.domain.ledger.events.TradeExecutionEvent;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/trades")
@Tag(name = "Trades", description = "Endpoints for viewing historical trades (executions)")
public class TradeController {

    private final LedgerPort ledgerPort;

    public TradeController(LedgerPort ledgerPort) {
        this.ledgerPort = ledgerPort;
    }

    @GetMapping("/{accountId}")
    @Operation(summary = "Get trade history", description = "Retrieves all trade executions for an account from the immutable ledger.")
    public ResponseEntity<List<TradeDto>> getTrades(@PathVariable UUID accountId) {
        List<LedgerEvent> events = ledgerPort.getEventsByAccountId(accountId);
        List<TradeDto> trades = events.stream()
                .filter(event -> event instanceof TradeExecutionEvent)
                .map(event -> (TradeExecutionEvent) event)
                .map(trade -> new TradeDto(
                        trade.eventId(),
                        null, // TradeExecutionEvent does not store orderId directly
                        trade.assetSymbol(),
                        java.math.BigDecimal.valueOf(trade.quantity()),
                        trade.price(),
                        trade.timestamp()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(trades);
    }
}
