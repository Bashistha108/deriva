package com.deriva.application.trading;

import com.deriva.persistence.trading.OrderRepository;
import com.deriva.persistence.trading.TradeRepository;
import org.springframework.stereotype.Service;

@Service
public class TradingService {

    private final OrderRepository orderRepository;
    private final TradeRepository tradeRepository;

    public TradingService(OrderRepository orderRepository, TradeRepository tradeRepository) {
        this.orderRepository = orderRepository;
        this.tradeRepository = tradeRepository;
    }

    public void processPendingOrders() {
        // Evaluate limits and market orders against the current simulated market
    }
}
