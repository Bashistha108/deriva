package com.deriva.domain.watchlist;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class WatchlistItemId implements Serializable {

    private UUID watchlist;
    private Long instrumentId;

    public WatchlistItemId() {}

    public WatchlistItemId(UUID watchlist, Long instrumentId) {
        this.watchlist = watchlist;
        this.instrumentId = instrumentId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WatchlistItemId that = (WatchlistItemId) o;
        return Objects.equals(watchlist, that.watchlist) &&
               Objects.equals(instrumentId, that.instrumentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(watchlist, instrumentId);
    }
}
