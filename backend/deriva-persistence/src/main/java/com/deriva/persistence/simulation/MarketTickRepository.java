package com.deriva.persistence.simulation;

import com.deriva.domain.simulation.MarketTick;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketTickRepository extends JpaRepository<MarketTick, Long> {
}
