package com.deriva.infrastructure.persistence.marketdata;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "market_data_cache")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketDataCacheEntity {

    @Id
    @Column(name = "ticker", nullable = false)
    private String ticker;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "options_data", columnDefinition = "jsonb")
    private String optionsData; // Storing as JSON string or JsonNode

    @Column(name = "last_updated_at", nullable = false)
    private Instant lastUpdatedAt;
}
