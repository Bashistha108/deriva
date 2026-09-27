package com.deriva.persistence.portfolio;

import com.deriva.domain.portfolio.PositionSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PositionSnapshotRepository extends JpaRepository<PositionSnapshot, Long> {
}
