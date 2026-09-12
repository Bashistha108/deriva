package com.deriva.domain.user;

import java.util.Set;
import java.util.UUID;

public record User(
        UUID id,
        String username,
        String email,
        String passwordHash,
        Set<String> roles,
        boolean active
) {
}
