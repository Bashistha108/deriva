package com.deriva.persistence.market;

import com.deriva.domain.market.DailyInstrumentSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;

@Repository
public interface DailyInstrumentSnapshotRepository extends JpaRepository<DailyInstrumentSnapshot, Long> {
    List<DailyInstrumentSnapshot> findByInstrumentIdOrderByTradeDateAsc(Long instrumentId);
    List<DailyInstrumentSnapshot> findByTradeDate(LocalDate tradeDate);
    DailyInstrumentSnapshot findTopByInstrumentIdOrderByTradeDateDesc(Long instrumentId);
}
