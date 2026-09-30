package com.deriva.application.watchlist;

import com.deriva.domain.watchlist.Watchlist;
import com.deriva.domain.watchlist.WatchlistItem;
import com.deriva.persistence.watchlist.WatchlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;

    public WatchlistService(WatchlistRepository watchlistRepository) {
        this.watchlistRepository = watchlistRepository;
    }

    @Transactional(readOnly = true)
    public List<Watchlist> getUserWatchlists(UUID userId) {
        return watchlistRepository.findByUserIdOrderByCreatedAtAsc(userId);
    }

    public Watchlist createWatchlist(UUID userId, String name) {
        Watchlist watchlist = new Watchlist(userId, name);
        return watchlistRepository.save(watchlist);
    }

    public Watchlist addItemToWatchlist(UUID userId, UUID watchlistId, Long instrumentId) {
        Watchlist watchlist = watchlistRepository.findById(watchlistId)
            .orElseThrow(() -> new IllegalArgumentException("Watchlist not found"));

        if (!watchlist.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to watchlist");
        }

        // Prevent duplicates
        boolean exists = watchlist.getItems().stream()
            .anyMatch(item -> item.getInstrumentId().equals(instrumentId));
        
        if (!exists) {
            int maxPosition = watchlist.getItems().stream()
                .mapToInt(WatchlistItem::getPosition)
                .max().orElse(0);
            
            WatchlistItem newItem = new WatchlistItem(watchlist, instrumentId, maxPosition + 1);
            watchlist.getItems().add(newItem);
        }

        return watchlistRepository.save(watchlist);
    }

    public Watchlist removeItemFromWatchlist(UUID userId, UUID watchlistId, Long instrumentId) {
        Watchlist watchlist = watchlistRepository.findById(watchlistId)
            .orElseThrow(() -> new IllegalArgumentException("Watchlist not found"));

        if (!watchlist.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to watchlist");
        }

        watchlist.getItems().removeIf(item -> item.getInstrumentId().equals(instrumentId));
        return watchlistRepository.save(watchlist);
    }

    public void removeWatchlist(UUID userId, UUID watchlistId) {
        Watchlist watchlist = watchlistRepository.findById(watchlistId)
            .orElseThrow(() -> new IllegalArgumentException("Watchlist not found"));
            
        if (!watchlist.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to watchlist");
        }
        
        watchlistRepository.delete(watchlist);
    }
}
