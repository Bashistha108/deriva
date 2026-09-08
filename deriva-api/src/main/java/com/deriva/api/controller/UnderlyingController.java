package com.deriva.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/underlyings")
@Tag(name = "Underlyings", description = "Endpoints for retrieving supported underlying assets")
public class UnderlyingController {

    @GetMapping
    @Operation(summary = "Get supported underlyings", description = "Retrieves a list of all supported underlying symbols.")
    public ResponseEntity<List<String>> getSupportedUnderlyings() {
        // Mocked for now, this would typically come from an Instrument catalog service
        return ResponseEntity.ok(List.of("AAPL", "MSFT", "TSLA", "SPY", "QQQ"));
    }
}
