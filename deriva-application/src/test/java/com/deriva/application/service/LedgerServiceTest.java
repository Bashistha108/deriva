package com.deriva.application.service;

import com.deriva.application.port.out.LedgerPort;
import com.deriva.application.service.impl.LedgerServiceImpl;
import com.deriva.domain.ledger.LedgerEntry;
import com.deriva.domain.ledger.events.LedgerEvent;
import com.deriva.domain.ledger.LedgerEventType;
import com.deriva.domain.ledger.events.CashMovementEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LedgerServiceTest {

    @Mock
    private LedgerPort ledgerPort;

    private LedgerService ledgerService;

    @BeforeEach
    void setUp() {
        ledgerService = new LedgerServiceImpl(ledgerPort);
    }

    @Test
    void shouldRecordCashMovementEvent() {
        // Arrange
        UUID eventId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        CashMovementEvent event = new CashMovementEvent(
                eventId,
                accountId,
                LedgerEventType.CASH_DEPOSIT,
                Instant.now(),
                new BigDecimal("1000.00"),
                "USD"
        );

        LedgerEntry mockEntry = new LedgerEntry(
                UUID.randomUUID(),
                accountId,
                LedgerEventType.CASH_DEPOSIT,
                eventId,
                new BigDecimal("1000.00"),
                "USD",
                null,
                "{}",
                event.timestamp()
        );

        when(ledgerPort.append(any(LedgerEvent.class))).thenReturn(mockEntry);

        // Act
        LedgerEntry result = ledgerService.recordEvent(event);

        // Assert
        assertNotNull(result);
        assertEquals(accountId, result.accountId());
        assertEquals(LedgerEventType.CASH_DEPOSIT, result.eventType());
        assertEquals(eventId, result.eventId());
        assertEquals(new BigDecimal("1000.00"), result.amount());

        ArgumentCaptor<LedgerEvent> captor = ArgumentCaptor.forClass(LedgerEvent.class);
        verify(ledgerPort).append(captor.capture());
        LedgerEvent captured = captor.getValue();
        assertEquals(accountId, captured.accountId());
        assertEquals(eventId, captured.eventId());
    }

    @Test
    void shouldThrowExceptionOnDuplicateEvent() {
        // Arrange
        UUID eventId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        CashMovementEvent event = new CashMovementEvent(
                eventId,
                accountId,
                LedgerEventType.CASH_DEPOSIT,
                Instant.now(),
                new BigDecimal("1000.00"),
                "USD"
        );

        when(ledgerPort.append(any(LedgerEvent.class))).thenThrow(new IllegalStateException("Event " + eventId + " already recorded"));

        // Act & Assert
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> ledgerService.recordEvent(event));
        assertTrue(ex.getMessage().contains("already recorded"));
    }
}
