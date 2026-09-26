package com.deriva.domain.market;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "option_contracts")
public class OptionContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "underlying_instrument_id", nullable = false)
    private Long underlyingInstrumentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "option_type", nullable = false)
    private OptionType optionType;

    @Column(name = "strike_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal strikePrice;

    @Column(name = "expiration_date", nullable = false)
    private LocalDate expirationDate;

    @Column(name = "contract_multiplier", nullable = false)
    private Integer contractMultiplier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OptionContractStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public OptionContract() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUnderlyingInstrumentId() { return underlyingInstrumentId; }
    public void setUnderlyingInstrumentId(Long underlyingInstrumentId) { this.underlyingInstrumentId = underlyingInstrumentId; }

    public OptionType getOptionType() { return optionType; }
    public void setOptionType(OptionType optionType) { this.optionType = optionType; }

    public BigDecimal getStrikePrice() { return strikePrice; }
    public void setStrikePrice(BigDecimal strikePrice) { this.strikePrice = strikePrice; }

    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }

    public Integer getContractMultiplier() { return contractMultiplier; }
    public void setContractMultiplier(Integer contractMultiplier) { this.contractMultiplier = contractMultiplier; }

    public OptionContractStatus getStatus() { return status; }
    public void setStatus(OptionContractStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
