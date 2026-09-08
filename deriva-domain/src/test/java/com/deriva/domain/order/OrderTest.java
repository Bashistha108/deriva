package com.deriva.domain.order;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class OrderTest {

    @Test
    void shouldCreateMarketOrder() {
        UUID accountId = UUID.randomUUID();
        OrderLeg leg = new OrderLeg(UUID.randomUUID(), "BTCUSD", OrderSide.BUY, 10, null);
        Order order = Order.create(accountId, "idem-1", OrderType.MARKET, List.of(leg));

        assertNotNull(order.id());
        assertEquals(OrderStatus.PENDING, order.status());
        assertEquals("idem-1", order.idempotencyKey());
        assertEquals(1, order.legs().size());
    }

    @Test
    void shouldOpenOrder() {
        Order order = Order.create(UUID.randomUUID(), "idem-1", OrderType.MARKET, 
                List.of(new OrderLeg(UUID.randomUUID(), "BTCUSD", OrderSide.BUY, 10, null)));
        Order opened = order.open();
        assertEquals(OrderStatus.OPEN, opened.status());
    }

    @Test
    void shouldCancelOpenOrder() {
        Order order = Order.create(UUID.randomUUID(), "idem-1", OrderType.MARKET, 
                List.of(new OrderLeg(UUID.randomUUID(), "BTCUSD", OrderSide.BUY, 10, null))).open();
        Order cancelled = order.cancel();
        assertEquals(OrderStatus.CANCELLED, cancelled.status());
    }

    @Test
    void shouldFillOrder() {
        Order order = Order.create(UUID.randomUUID(), "idem-1", OrderType.MARKET, 
                List.of(new OrderLeg(UUID.randomUUID(), "BTCUSD", OrderSide.BUY, 10, null))).open();
        
        Execution exec = new Execution(UUID.randomUUID(), order.id(), "BTCUSD", 10, BigDecimal.valueOf(50000), Instant.now());
        Order filled = order.fill(List.of(exec));

        assertEquals(OrderStatus.FILLED, filled.status());
        assertEquals(1, filled.executions().size());
    }
}
