package com.deriva.api.controller;

import com.deriva.api.dto.OrderRequestDto;
import com.deriva.api.dto.OrderResponseDto;
import com.deriva.application.port.in.OrderManagementUseCase;
import com.deriva.domain.common.Quantity;
import com.deriva.domain.common.Symbol;
import com.deriva.domain.order.Order;
import com.deriva.domain.order.OrderId;
import com.deriva.domain.order.OrderLeg;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders", description = "Endpoints for managing orders")
public class OrderController {

    private final OrderManagementUseCase orderManagementUseCase;

    public OrderController(OrderManagementUseCase orderManagementUseCase) {
        this.orderManagementUseCase = orderManagementUseCase;
    }

    @PostMapping
    @Operation(summary = "Submit a new order", description = "Creates a new order in the system.")
    public ResponseEntity<OrderResponseDto> submitOrder(@Valid @RequestBody OrderRequestDto request) {
        List<OrderLeg> legs = request.legs().stream()
                .map(leg -> new OrderLeg(UUID.randomUUID(), leg.symbol(), leg.side(), leg.quantity().intValue(), java.math.BigDecimal.ZERO))
                .collect(Collectors.toList());

        Order order = orderManagementUseCase.submitOrder(
                request.accountId(),
                request.idempotencyKey(),
                request.type(),
                legs
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(OrderResponseDto.fromDomain(order));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order details", description = "Retrieves the details of a specific order.")
    public ResponseEntity<OrderResponseDto> getOrder(@PathVariable UUID orderId) {
        Order order = orderManagementUseCase.getOrder(new OrderId(orderId));
        return ResponseEntity.ok(OrderResponseDto.fromDomain(order));
    }

    @DeleteMapping("/{orderId}")
    @Operation(summary = "Cancel an order", description = "Attempts to cancel an existing order.")
    public ResponseEntity<OrderResponseDto> cancelOrder(@PathVariable UUID orderId) {
        Order order = orderManagementUseCase.cancelOrder(new OrderId(orderId));
        return ResponseEntity.ok(OrderResponseDto.fromDomain(order));
    }
}
