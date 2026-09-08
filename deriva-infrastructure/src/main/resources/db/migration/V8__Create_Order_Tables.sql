CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    account_id VARCHAR(36) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_orders_account_idempotency UNIQUE (account_id, idempotency_key)
);

CREATE TABLE order_legs (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    side VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    limit_price DECIMAL(19, 4),
    CONSTRAINT fk_order_legs_order FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE executions (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(19, 4) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_executions_order FOREIGN KEY (order_id) REFERENCES orders(id)
);
