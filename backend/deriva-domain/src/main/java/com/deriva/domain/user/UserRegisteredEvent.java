package com.deriva.domain.user;

import java.util.UUID;

public class UserRegisteredEvent {
    private final UUID userId;

    public UserRegisteredEvent(UUID userId) {
        this.userId = userId;
    }

    public UUID getUserId() {
        return userId;
    }
}
