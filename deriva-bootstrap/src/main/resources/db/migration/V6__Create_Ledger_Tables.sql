-- V6__Create_Ledger_Tables.sql

CREATE TABLE ledger_entry (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_id UUID NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    reference_entity_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_ledger_account FOREIGN KEY (account_id) REFERENCES user_account(id),
    CONSTRAINT uq_ledger_account_event UNIQUE (account_id, event_id)
);

CREATE INDEX idx_ledger_account_created ON ledger_entry(account_id, created_at);
