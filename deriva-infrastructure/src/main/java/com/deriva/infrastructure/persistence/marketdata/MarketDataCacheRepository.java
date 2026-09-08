package com.deriva.infrastructure.persistence.marketdata;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketDataCacheRepository extends JpaRepository<MarketDataCacheEntity, String> {
}
