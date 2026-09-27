package com.deriva.persistence.market;

import com.deriva.domain.market.MarketPriceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MarketPriceSnapshotRepository extends JpaRepository<MarketPriceSnapshot, Long> {
    List<MarketPriceSnapshot> findByInstrumentIdAndTimestampBetweenOrderByTimestampAsc(Long instrumentId, LocalDateTime start, LocalDateTime end);
    List<MarketPriceSnapshot> findTop100ByInstrumentIdOrderByTimestampDesc(Long instrumentId);
}
