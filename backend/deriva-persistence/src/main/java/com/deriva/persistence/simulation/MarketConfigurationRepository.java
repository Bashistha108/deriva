package com.deriva.persistence.simulation;

import com.deriva.domain.simulation.MarketConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketConfigurationRepository extends JpaRepository<MarketConfiguration, Long> {
}
