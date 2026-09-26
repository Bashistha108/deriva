package com.deriva.api.watchlist;

import com.deriva.application.watchlist.WatchlistService;
import com.deriva.domain.watchlist.Watchlist;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.deriva.domain.user.User;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/watchlists")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @GetMapping
    public ResponseEntity<List<Watchlist>> getWatchlists(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(watchlistService.getUserWatchlists(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Watchlist> createWatchlist(@AuthenticationPrincipal User user, @RequestBody String name) {
        return ResponseEntity.ok(watchlistService.createWatchlist(user.getId(), name));
    }

    @PostMapping("/{watchlistId}/items")
    public ResponseEntity<Watchlist> addItem(@AuthenticationPrincipal User user, @PathVariable UUID watchlistId, @RequestBody Long instrumentId) {
        return ResponseEntity.ok(watchlistService.addItemToWatchlist(user.getId(), watchlistId, instrumentId));
    }

    @DeleteMapping("/{watchlistId}")
    public ResponseEntity<Void> deleteWatchlist(@AuthenticationPrincipal User user, @PathVariable UUID watchlistId) {
        watchlistService.removeWatchlist(user.getId(), watchlistId);
        return ResponseEntity.noContent().build();
    }
}
