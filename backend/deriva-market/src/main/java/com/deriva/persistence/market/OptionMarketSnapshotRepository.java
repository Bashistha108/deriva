package com.deriva.persistence.market;

import com.deriva.domain.market.OptionMarketSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionMarketSnapshotRepository extends JpaRepository<OptionMarketSnapshot, Long> {
    List<OptionMarketSnapshot> findTop100ByOptionContractIdOrderByTimestampDesc(Long optionContractId);
}
