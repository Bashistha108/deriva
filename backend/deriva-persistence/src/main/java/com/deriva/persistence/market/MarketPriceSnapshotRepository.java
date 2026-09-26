package com.deriva.persistence.market;

import com.deriva.domain.market.MarketPriceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketPriceSnapshotRepository extends JpaRepository<MarketPriceSnapshot, Long> {
}
