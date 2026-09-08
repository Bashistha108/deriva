package com.deriva.application.service.impl;

import com.deriva.application.port.out.OrderPort;
import com.deriva.domain.order.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderManagementServiceTest {

    private OrderPort orderPort;
    private ExecutionSimulator executionSimulator;
    private OrderManagementService service;

    @BeforeEach
    void setUp() {
        orderPort = mock(OrderPort.class);
        executionSimulator = mock(ExecutionSimulator.class);
        service = new OrderManagementService(orderPort, executionSimulator);
    }

    @Test
    void shouldSubmitOrderSuccessfully() {
        UUID accountId = UUID.randomUUID();
        String idemKey = "idem-123";
        OrderLeg leg = new OrderLeg(UUID.randomUUID(), "BTCUSD", OrderSide.BUY, 10, null);

        when(orderPort.existsByAccountIdAndIdempotencyKey(accountId, idemKey)).thenReturn(false);
        
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        when(orderPort.save(orderCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));
        when(executionSimulator.simulateExecution(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            return new Order(o.id(), o.accountId(), o.idempotencyKey(), o.type(), OrderStatus.FILLED, o.legs(), o.executions(), o.createdAt());
        });

        Order result = service.submitOrder(accountId, idemKey, OrderType.MARKET, List.of(leg));

        assertNotNull(result);
        assertEquals(OrderStatus.FILLED, result.status());
        
        // Saved twice: initially as PENDING, then as OPEN (or partially filled / filled)
        verify(orderPort, times(2)).save(any(Order.class));
    }

    @Test
    void shouldRejectDuplicateIdempotencyKey() {
        UUID accountId = UUID.randomUUID();
        String idemKey = "idem-123";
        OrderLeg leg = new OrderLeg(UUID.randomUUID(), "BTCUSD", OrderSide.BUY, 10, null);

        when(orderPort.existsByAccountIdAndIdempotencyKey(accountId, idemKey)).thenReturn(true);

        assertThrows(IllegalStateException.class, () -> 
            service.submitOrder(accountId, idemKey, OrderType.MARKET, List.of(leg))
        );
        
        verify(orderPort, never()).save(any());
    }
}
