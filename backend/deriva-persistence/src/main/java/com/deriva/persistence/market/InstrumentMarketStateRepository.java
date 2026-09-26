package com.deriva.persistence.market;

import com.deriva.domain.market.InstrumentMarketState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstrumentMarketStateRepository extends JpaRepository<InstrumentMarketState, Long> {
    Optional<InstrumentMarketState> findByInstrumentId(Long instrumentId);
}
