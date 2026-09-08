package com.deriva.domain.account;

import java.util.UUID;

public record Account(
        UUID id,
        UUID userId,
        String accountType,
        String currency
) {
}
