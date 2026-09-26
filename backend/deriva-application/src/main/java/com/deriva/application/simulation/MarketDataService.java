package com.deriva.application.simulation;

import com.deriva.domain.market.MarketPriceSnapshot;
import com.deriva.persistence.market.MarketPriceSnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MarketDataService {

    private final MarketPriceSnapshotRepository snapshotRepository;

    public MarketDataService(MarketPriceSnapshotRepository snapshotRepository) {
        this.snapshotRepository = snapshotRepository;
    }

    @Transactional(readOnly = true)
    public List<MarketPriceSnapshot> getHistoricalPrices(Long instrumentId, LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null) {
            return snapshotRepository.findByInstrumentIdAndTimestampBetweenOrderByTimestampAsc(instrumentId, start, end);
        } else {
            return snapshotRepository.findTop100ByInstrumentIdOrderByTimestampDesc(instrumentId);
        }
    }
}
