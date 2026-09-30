package com.deriva.domain.watchlist;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "watchlist_items")
@IdClass(WatchlistItemId.class)
public class WatchlistItem {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "watchlist_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Watchlist watchlist;

    @Id
    @Column(name = "instrument_id", nullable = false)
    private Long instrumentId;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public WatchlistItem() {}

    public WatchlistItem(Watchlist watchlist, Long instrumentId, Integer position) {
        this.watchlist = watchlist;
        this.instrumentId = instrumentId;
        this.position = position;
    }

    // Getters and setters...
    public Watchlist getWatchlist() { return watchlist; }
    public Long getInstrumentId() { return instrumentId; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
