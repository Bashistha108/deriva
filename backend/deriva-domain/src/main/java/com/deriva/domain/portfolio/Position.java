package com.deriva.domain.portfolio;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "positions")
public class Position {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "instrument_id")
    private Long instrumentId;

    @Column(name = "option_contract_id")
    private Long optionContractId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "average_entry_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal averageEntryPrice;

    @Column(name = "realized_pnl", nullable = false, precision = 19, scale = 4)
    private BigDecimal realizedPnl;

    @Column(name = "opened_at", nullable = false)
    private LocalDateTime openedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    @Column(nullable = false)
    private Integer version;

    @PrePersist
    @PreUpdate
    private void validateTarget() {
        if ((instrumentId == null && optionContractId == null) || (instrumentId != null && optionContractId != null)) {
            throw new IllegalStateException("Exactly one of instrument_id or option_contract_id must be populated.");
        }
    }

    public Position() {}

    // Getters and setters omitted for brevity...
}
