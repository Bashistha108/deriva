-- V7__Add_Payload_To_Ledger.sql

ALTER TABLE ledger_entry ADD COLUMN payload TEXT NOT NULL DEFAULT '{}';
