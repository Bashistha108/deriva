package com.deriva.api.trading;

import com.deriva.application.security.CustomUserDetails;
import com.deriva.application.trading.TradingService;
import com.deriva.domain.market.Instrument;
import com.deriva.domain.market.OptionContract;
import com.deriva.domain.market.OptionType;
import com.deriva.domain.trading.Order;
import com.deriva.domain.trading.OrderSide;
import com.deriva.domain.trading.OrderType;
import com.deriva.persistence.market.InstrumentRepository;
import com.deriva.persistence.market.OptionContractRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trading")
public class TradingController {

    private final TradingService tradingService;
    private final InstrumentRepository instrumentRepository;
    private final OptionContractRepository optionContractRepository;

    public TradingController(TradingService tradingService, InstrumentRepository instrumentRepository, OptionContractRepository optionContractRepository) {
        this.tradingService = tradingService;
        this.instrumentRepository = instrumentRepository;
        this.optionContractRepository = optionContractRepository;
    }

    public static class OrderRequest {
        public String symbol; // Underlying symbol
        public BigDecimal strike; 
        public String expiration; // YYYY-MM-DD
        public String optionType; // CALL or PUT
        public String side; // BUY or SELL
        public String type; // MARKET or LIMIT
        public int quantity;
        public BigDecimal limitPrice;
    }

    private Long resolveInstrumentId(String symbol) {
        if (symbol == null) return null;
        return instrumentRepository.findAll().stream()
                .filter(i -> i.getSymbol().equalsIgnoreCase(symbol))
                .map(Instrument::getId)
                .findFirst().orElse(null);
    }

    private Long resolveOptionContractId(Long instrumentId, OrderRequest request) {
        if (instrumentId == null || request.strike == null || request.expiration == null || request.optionType == null) return null;
        LocalDate exp = LocalDate.parse(request.expiration);
        OptionType type = OptionType.valueOf(request.optionType.toUpperCase());
        
        return optionContractRepository.findAll().stream()
                .filter(o -> o.getUnderlyingInstrumentId().equals(instrumentId) && 
                             o.getStrikePrice().compareTo(request.strike) == 0 &&
                             o.getExpirationDate().equals(exp) &&
                             o.getOptionType() == type)
                .map(OptionContract::getId)
                .findFirst().orElse(null);
    }

    @PostMapping("/orders")
    public ResponseEntity<List<Order>> placeMultiLegOrder(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody List<OrderRequest> requests) {
            
        if (user == null) return ResponseEntity.status(401).build();

        List<Order> orders = requests.stream().map(request -> {
            Long instrumentId = resolveInstrumentId(request.symbol);
            Long optionContractId = resolveOptionContractId(instrumentId, request);
            
            return tradingService.placeOrder(
                user.getId(),
                instrumentId,
                optionContractId,
                OrderSide.valueOf(request.side.toUpperCase()),
                OrderType.valueOf(request.type.toUpperCase()),
                request.quantity,
                request.limitPrice
            );
        }).toList();
        
        return ResponseEntity.ok(orders);
    }
}
