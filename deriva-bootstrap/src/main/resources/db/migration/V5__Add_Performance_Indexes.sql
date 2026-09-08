CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_options_instrument_id ON option_contracts(underlying_instrument_id);
CREATE INDEX idx_historical_prices_instrument_id ON historical_prices(instrument_id);
CREATE INDEX idx_historical_prices_date ON historical_prices(trade_date);
