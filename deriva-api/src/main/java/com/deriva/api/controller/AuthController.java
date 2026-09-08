package com.deriva.api.controller;

import com.deriva.api.dto.AuthRequestDto;
import com.deriva.api.dto.TokenResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication (Mocked)")
public class AuthController {

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Returns a mock JWT token for testing.")
    public ResponseEntity<TokenResponseDto> login(@Valid @RequestBody AuthRequestDto request) {
        // Mocked implementation since Phase C (Security) is deferred
        return ResponseEntity.ok(new TokenResponseDto(
                "mock-jwt-access-token-for-" + request.username(),
                "mock-jwt-refresh-token",
                3600
        ));
    }
}
