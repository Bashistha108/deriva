CREATE TABLE market_data_cache (
    ticker VARCHAR(50) PRIMARY KEY,
    options_data JSONB,
    last_updated_at TIMESTAMP NOT NULL
);
