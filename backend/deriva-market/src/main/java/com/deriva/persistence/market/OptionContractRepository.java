package com.deriva.persistence.market;

import com.deriva.domain.market.OptionContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OptionContractRepository extends JpaRepository<OptionContract, Long> {
    List<OptionContract> findByUnderlyingInstrumentIdAndExpirationDateGreaterThanEqual(Long underlyingInstrumentId, LocalDate date);
}
