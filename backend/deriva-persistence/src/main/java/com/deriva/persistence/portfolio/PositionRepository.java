package com.deriva.persistence.portfolio;

import com.deriva.domain.portfolio.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PositionRepository extends JpaRepository<Position, UUID> {
    List<Position> findByUserId(UUID userId);
    Optional<Position> findByUserIdAndInstrumentId(UUID userId, Long instrumentId);
    Optional<Position> findByUserIdAndOptionContractId(UUID userId, Long optionContractId);
}
