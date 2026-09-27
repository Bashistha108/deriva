package com.deriva.persistence.simulation;

import com.deriva.domain.simulation.MarketConfigurationVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketConfigurationVersionRepository extends JpaRepository<MarketConfigurationVersion, Long> {
}
