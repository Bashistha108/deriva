package com.deriva.marketdata;

import com.deriva.domain.common.Percentage;
import com.deriva.domain.common.Price;
import com.deriva.domain.common.Symbol;
import com.deriva.domain.instrument.OptionContract;
import com.deriva.domain.instrument.OptionExpiration;
import com.deriva.domain.instrument.OptionType;
import com.deriva.domain.instrument.Underlying;
import com.deriva.domain.marketdata.MarketQuote;
import com.deriva.domain.marketdata.OptionQuote;
import com.deriva.quant.pricing.BlackScholes;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Primary
public class MockMarketDataProvider implements MarketDataProvider {

    private final Map<Symbol, MarketQuote> spotPrices = new ConcurrentHashMap<>();
    private static final double RISK_FREE_RATE = 0.05;
    private static final double DIVIDEND_YIELD = 0.02;
    private static final double BASE_VOLATILITY = 0.20;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MockMarketDataProvider() {
        spotPrices.put(new Symbol("SPY"), new MarketQuote(new Symbol("SPY"), new Price(new BigDecimal("500.00")), new Price(new BigDecimal("500.10")), new Price(new BigDecimal("500.05")), 1000000));
        spotPrices.put(new Symbol("QQQ"), new MarketQuote(new Symbol("QQQ"), new Price(new BigDecimal("400.00")), new Price(new BigDecimal("400.15")), new Price(new BigDecimal("400.08")), 800000));
        spotPrices.put(new Symbol("AAPL"), new MarketQuote(new Symbol("AAPL"), new Price(new BigDecimal("175.00")), new Price(new BigDecimal("175.05")), new Price(new BigDecimal("175.02")), 500000));
        spotPrices.put(new Symbol("MSFT"), new MarketQuote(new Symbol("MSFT"), new Price(new BigDecimal("415.00")), new Price(new BigDecimal("415.10")), new Price(new BigDecimal("415.05")), 900000));
        spotPrices.put(new Symbol("TSLA"), new MarketQuote(new Symbol("TSLA"), new Price(new BigDecimal("185.00")), new Price(new BigDecimal("185.10")), new Price(new BigDecimal("185.05")), 700000));
        spotPrices.put(new Symbol("SOXS"), new MarketQuote(new Symbol("SOXS"), new Price(new BigDecimal("43.37")), new Price(new BigDecimal("43.40")), new Price(new BigDecimal("43.38")), 500000));
    }

    private MarketQuote getOrCreateSpot(String ticker) {
        Symbol symbol = new Symbol(ticker);
        return spotPrices.computeIfAbsent(symbol, s -> {
            // Generate a random mock price between 50 and 500
            double mockPrice = 50 + (Math.random() * 450);
            BigDecimal p = BigDecimal.valueOf(mockPrice).setScale(2, RoundingMode.HALF_UP);
            return new MarketQuote(symbol, new Price(p), new Price(p), new Price(p), 10000);
        });
    }

    @Override
    @org.springframework.cache.annotation.Cacheable(value = "quotes", key = "#symbol.value()")
    public MarketQuote getUnderlyingQuote(Symbol symbol) {
        return getOrCreateSpot(symbol.value());
    }

    @Override
    @org.springframework.cache.annotation.Cacheable(value = "optionChains", key = "#underlyingSymbol.value()")
    public List<OptionQuote> getOptionChain(Symbol underlyingSymbol) {
        MarketQuote spotQuote = getOrCreateSpot(underlyingSymbol.value());
        double S = spotQuote.last().value().doubleValue();
        List<OptionQuote> chain = new ArrayList<>();
        Underlying underlying = new Underlying(underlyingSymbol, underlyingSymbol.value(), "MOCK");

        int[] daysToExpiry = {30, 60, 90};
        LocalDate now = LocalDate.now();

        for (int days : daysToExpiry) {
            LocalDate expirationDate = now.plusDays(days);
            OptionExpiration expiration = new OptionExpiration(expirationDate);
            double T = days / 365.0;

            double step = Math.round(S * 0.01);
            if (step == 0) step = 1;
            double startStrike = Math.floor(S * 0.9 / step) * step;
            double endStrike = Math.ceil(S * 1.1 / step) * step;

            for (double K = startStrike; K <= endStrike; K += step) {
                double moneyness = Math.log(S / K);
                double sigma = BASE_VOLATILITY + 0.1 * moneyness * moneyness;

                chain.add(createQuote(underlying, expiration, OptionType.CALL, S, K, T, sigma));
                chain.add(createQuote(underlying, expiration, OptionType.PUT, S, K, T, sigma));
            }
        }
        return chain;
    }

    private OptionQuote createQuote(Underlying underlying, OptionExpiration expiration, OptionType type, double S, double K, double T, double sigma) {
        OptionContract contract = new OptionContract(underlying, type, new Price(BigDecimal.valueOf(K)), expiration, 100);
        
        double price = type == OptionType.CALL 
                ? BlackScholes.callPrice(S, K, T, RISK_FREE_RATE, DIVIDEND_YIELD, sigma)
                : BlackScholes.putPrice(S, K, T, RISK_FREE_RATE, DIVIDEND_YIELD, sigma);
        
        double delta = type == OptionType.CALL
                ? BlackScholes.callDelta(S, K, T, RISK_FREE_RATE, DIVIDEND_YIELD, sigma)
                : BlackScholes.putDelta(S, K, T, RISK_FREE_RATE, DIVIDEND_YIELD, sigma);
        
        double gamma = BlackScholes.gamma(S, K, T, RISK_FREE_RATE, DIVIDEND_YIELD, sigma);
        double vega = BlackScholes.vega(S, K, T, RISK_FREE_RATE, DIVIDEND_YIELD, sigma);
        
        double theta = type == OptionType.CALL
                ? BlackScholes.callTheta(S, K, T, RISK_FREE_RATE, DIVIDEND_YIELD, sigma)
                : BlackScholes.putTheta(S, K, T, RISK_FREE_RATE, DIVIDEND_YIELD, sigma);
        
        double rho = type == OptionType.CALL
                ? BlackScholes.callRho(S, K, T, RISK_FREE_RATE, DIVIDEND_YIELD, sigma)
                : BlackScholes.putRho(S, K, T, RISK_FREE_RATE, DIVIDEND_YIELD, sigma);

        double spread = Math.max(0.01, price * 0.01);
        double bidVal = Math.max(0.0, price - spread / 2);
        double askVal = price + spread / 2;

        return new OptionQuote(
                contract,
                new Price(BigDecimal.valueOf(bidVal).setScale(4, RoundingMode.HALF_UP)),
                new Price(BigDecimal.valueOf(askVal).setScale(4, RoundingMode.HALF_UP)),
                new Price(BigDecimal.valueOf(price).setScale(4, RoundingMode.HALF_UP)),
                (long) (Math.random() * 1000),
                new Percentage(sigma),
                BigDecimal.valueOf(delta).setScale(4, RoundingMode.HALF_UP),
                BigDecimal.valueOf(gamma).setScale(4, RoundingMode.HALF_UP),
                BigDecimal.valueOf(theta).setScale(4, RoundingMode.HALF_UP),
                BigDecimal.valueOf(vega).setScale(4, RoundingMode.HALF_UP),
                BigDecimal.valueOf(rho).setScale(4, RoundingMode.HALF_UP)
        );
    }
    
    @Override
    public String getRawOptionChain(String symbol, Long date) {
        try {
            MarketQuote spotQuote = getOrCreateSpot(symbol);
            double S = spotQuote.last().value().doubleValue();
            
            ObjectNode rootNode = objectMapper.createObjectNode();
            ObjectNode optionChain = rootNode.putObject("optionChain");
            ArrayNode result = optionChain.putArray("result");
            
            ObjectNode resultItem = result.addObject();
            resultItem.put("underlyingSymbol", symbol);
            
            // Expiration dates
            ArrayNode expirationDates = resultItem.putArray("expirationDates");
            int[] daysToExpiry = {30, 60, 90};
            LocalDate now = LocalDate.now();
            List<Long> expTs = new ArrayList<>();
            for (int days : daysToExpiry) {
                long ts = now.plusDays(days).atStartOfDay().toEpochSecond(ZoneOffset.UTC);
                expTs.add(ts);
                expirationDates.add(ts);
            }
            
            // Quote object
            ObjectNode quoteObj = resultItem.putObject("quote");
            quoteObj.put("regularMarketPrice", S);
            double change = (Math.random() * 4) - 2;
            quoteObj.put("regularMarketChange", change);
            quoteObj.put("regularMarketChangePercent", (change / S) * 100);
            
            // Options array
            ArrayNode optionsNode = resultItem.putArray("options");
            ObjectNode optionItem = optionsNode.addObject();
            
            long targetExpTs = date != null ? date : expTs.get(0);
            
            ArrayNode calls = optionItem.putArray("calls");
            ArrayNode puts = optionItem.putArray("puts");
            
            double T = Math.max(1.0, (targetExpTs - Instant.now().getEpochSecond()) / (365.0 * 24 * 3600));
            double step = Math.round(S * 0.01);
            if (step == 0) step = 1;
            double startStrike = Math.floor(S * 0.9 / step) * step;
            double endStrike = Math.ceil(S * 1.1 / step) * step;

            for (double K = startStrike; K <= endStrike; K += step) {
                double moneyness = Math.log(S / K);
                double sigma = BASE_VOLATILITY + 0.1 * moneyness * moneyness;
                
                // Call
                double callPrice = BlackScholes.callPrice(S, K, T, RISK_FREE_RATE, DIVIDEND_YIELD, sigma);
                ObjectNode callNode = calls.addObject();
                callNode.put("strike", K);
                callNode.put("expiration", targetExpTs);
                callNode.put("bid", Math.max(0, callPrice - 0.05));
                callNode.put("ask", callPrice + 0.05);
                callNode.put("lastPrice", callPrice);
                callNode.put("impliedVolatility", sigma);
                callNode.put("volume", (int)(Math.random() * 500));
                
                // Put
                double putPrice = BlackScholes.putPrice(S, K, T, RISK_FREE_RATE, DIVIDEND_YIELD, sigma);
                ObjectNode putNode = puts.addObject();
                putNode.put("strike", K);
                putNode.put("expiration", targetExpTs);
                putNode.put("bid", Math.max(0, putPrice - 0.05));
                putNode.put("ask", putPrice + 0.05);
                putNode.put("lastPrice", putPrice);
                putNode.put("impliedVolatility", sigma);
                putNode.put("volume", (int)(Math.random() * 500));
            }
            
            return objectMapper.writeValueAsString(rootNode);
        } catch (Exception e) {
            e.printStackTrace();
            return "{}";
        }
    }
}
