package com.deriva.domain.trading;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trades")
public class Trade {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "instrument_id")
    private Long instrumentId;

    @Column(name = "option_contract_id")
    private Long optionContractId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderSide side;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "execution_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal executionPrice;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal fees;

    @Column(name = "executed_at", nullable = false)
    private LocalDateTime executedAt;

    @Column(name = "market_tick_id", nullable = false)
    private Long marketTickId;

    public Trade() {}

    // Getters and Setters omitted for brevity...
}
