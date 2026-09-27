package com.deriva.persistence.market;

import com.deriva.domain.market.InstrumentSimulationParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstrumentSimulationParameterRepository extends JpaRepository<InstrumentSimulationParameter, Long> {
}
