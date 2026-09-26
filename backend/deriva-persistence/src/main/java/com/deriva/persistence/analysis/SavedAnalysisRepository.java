package com.deriva.persistence.analysis;

import com.deriva.domain.analysis.SavedAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavedAnalysisRepository extends JpaRepository<SavedAnalysis, UUID> {
    List<SavedAnalysis> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
