CREATE TABLE option_contracts (
    id UUID PRIMARY KEY,
    underlying_instrument_id UUID NOT NULL REFERENCES instruments(id),
    option_type VARCHAR(10) NOT NULL,
    strike_price DECIMAL(19, 4) NOT NULL,
    expiration_date DATE NOT NULL,
    contract_size INT NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(underlying_instrument_id, option_type, strike_price, expiration_date)
);
