package com.deriva.api.dto;

public record TokenResponseDto(
        String accessToken,
        String refreshToken,
        long expiresIn
) {
}
