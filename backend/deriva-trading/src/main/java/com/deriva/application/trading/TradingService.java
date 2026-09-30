package com.deriva.application.trading;

import com.deriva.application.portfolio.CashAccountService;
import com.deriva.application.portfolio.PortfolioService;
import com.deriva.domain.trading.Order;
import com.deriva.domain.trading.OrderSide;
import com.deriva.domain.trading.OrderStatus;
import com.deriva.domain.trading.OrderType;
import com.deriva.domain.trading.Trade;
import com.deriva.persistence.trading.OrderRepository;
import com.deriva.persistence.trading.TradeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TradingService {

    private final OrderRepository orderRepository;
    private final TradeRepository tradeRepository;
    private final CashAccountService cashAccountService;
    private final PortfolioService portfolioService;

    public TradingService(OrderRepository orderRepository, TradeRepository tradeRepository, CashAccountService cashAccountService, PortfolioService portfolioService) {
        this.orderRepository = orderRepository;
        this.tradeRepository = tradeRepository;
        this.cashAccountService = cashAccountService;
        this.portfolioService = portfolioService;
    }

    @Transactional
    public Order placeOrder(UUID userId, Long instrumentId, Long optionContractId, OrderSide side, OrderType type, int quantity, BigDecimal limitPrice) {
        Long actualInstrumentId = optionContractId != null ? null : instrumentId;
        Order order = new Order();
        order.setUserId(userId);
        order.setInstrumentId(actualInstrumentId);
        order.setOptionContractId(optionContractId);
        order.setSide(side);
        order.setOrderType(type);
        order.setQuantity(quantity);
        order.setLimitPrice(limitPrice);
        order.setIdempotencyKey(UUID.randomUUID().toString());
        order.setStatus(OrderStatus.PENDING);
        order.setSubmittedAt(LocalDateTime.now());
        order.setVersion(0);
        
        return orderRepository.save(order);
    }

    @Scheduled(fixedRate = 1000)
    @Transactional
    public void processPendingOrders() {
        List<Order> pending = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING)
                .toList();

        for (Order order : pending) {
            // For now, assume MARKET orders fill immediately at $10.0 for simulation
            // A real system would use MarketDataService to get the exact bid/ask price
            BigDecimal fillPrice = new BigDecimal("10.00");
            
            order.setStatus(OrderStatus.FILLED);
            order.setFilledAt(LocalDateTime.now());
            orderRepository.save(order);
            
            Trade trade = new Trade();
            trade.setOrderId(order.getId());
            trade.setUserId(order.getUserId());
            trade.setInstrumentId(order.getInstrumentId());
            trade.setOptionContractId(order.getOptionContractId());
            trade.setSide(order.getSide());
            trade.setQuantity(order.getQuantity());
            trade.setExecutionPrice(fillPrice);
            trade.setExecutedAt(LocalDateTime.now());
            trade.setFees(BigDecimal.ZERO);
            trade.setMarketTickId(1L); // Placeholder for mock execution
            trade = tradeRepository.save(trade);
            
            BigDecimal notional = fillPrice.multiply(BigDecimal.valueOf(order.getQuantity())).multiply(BigDecimal.valueOf(100));
            BigDecimal cashImpact = order.getSide() == OrderSide.BUY ? notional.negate() : notional;
            
            cashAccountService.settleTrade(order.getUserId(), cashImpact, trade.getId());
            
            int sign = order.getSide() == OrderSide.BUY ? 1 : -1;
            portfolioService.updatePosition(order.getUserId(), order.getInstrumentId(), order.getOptionContractId(), order.getQuantity() * sign, fillPrice);
        }
    }
}
