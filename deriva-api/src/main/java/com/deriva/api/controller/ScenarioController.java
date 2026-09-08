package com.deriva.api.controller;

import com.deriva.api.dto.ScenarioRequestDto;
import com.deriva.api.dto.ScenarioResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/scenarios")
@Tag(name = "Scenarios", description = "Endpoints for what-if scenario analysis")
public class ScenarioController {

    @PostMapping
    @Operation(summary = "Run what-if scenario", description = "Runs a scenario analysis on the portfolio based on parameter shifts.")
    public ResponseEntity<ScenarioResponseDto> runScenario(@RequestBody ScenarioRequestDto request) {
        // Mocked implementation of scenario runner
        ScenarioResponseDto response = new ScenarioResponseDto(
                request.accountId(),
                new BigDecimal("-4500.00"), // hypothetical loss under shift
                new BigDecimal("0.60")     // hypothetical margin usage increase
        );
        return ResponseEntity.ok(response);
    }
}
