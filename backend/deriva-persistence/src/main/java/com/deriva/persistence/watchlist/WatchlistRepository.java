package com.deriva.persistence.watchlist;

import com.deriva.domain.watchlist.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, UUID> {
    List<Watchlist> findByUserIdOrderByCreatedAtAsc(UUID userId);
}
