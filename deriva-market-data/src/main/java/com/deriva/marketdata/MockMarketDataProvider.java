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
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MockMarketDataProvider implements MarketDataProvider {

    private final Map<Symbol, MarketQuote> spotPrices = new ConcurrentHashMap<>();
    private static final double RISK_FREE_RATE = 0.05;
    private static final double DIVIDEND_YIELD = 0.02;
    private static final double BASE_VOLATILITY = 0.20;

    public MockMarketDataProvider() {
        // Initialize with some realistic spot prices
        spotPrices.put(new Symbol("SPY"), new MarketQuote(new Symbol("SPY"), new Price(new BigDecimal("500.00")), new Price(new BigDecimal("500.10")), new Price(new BigDecimal("500.05")), 1000000));
        spotPrices.put(new Symbol("QQQ"), new MarketQuote(new Symbol("QQQ"), new Price(new BigDecimal("400.00")), new Price(new BigDecimal("400.15")), new Price(new BigDecimal("400.08")), 800000));
        spotPrices.put(new Symbol("AAPL"), new MarketQuote(new Symbol("AAPL"), new Price(new BigDecimal("175.00")), new Price(new BigDecimal("175.05")), new Price(new BigDecimal("175.02")), 500000));
    }

    @Override
    public MarketQuote getUnderlyingQuote(Symbol symbol) {
        return spotPrices.get(symbol);
    }

    @Override
    public List<OptionQuote> getOptionChain(Symbol underlyingSymbol) {
        MarketQuote spotQuote = spotPrices.get(underlyingSymbol);
        if (spotQuote == null) return List.of();

        double S = spotQuote.last().value().doubleValue();
        List<OptionQuote> chain = new ArrayList<>();
        Underlying underlying = new Underlying(underlyingSymbol, underlyingSymbol.value(), "MOCK");

        // Generate expirations (30, 60, 90 days)
        int[] daysToExpiry = {30, 60, 90};
        LocalDate now = LocalDate.now();

        for (int days : daysToExpiry) {
            LocalDate expirationDate = now.plusDays(days);
            OptionExpiration expiration = new OptionExpiration(expirationDate);
            double T = days / 365.0;

            // Generate strikes +/- 10% from spot
            double step = Math.round(S * 0.01);
            if (step == 0) step = 1;
            double startStrike = Math.floor(S * 0.9 / step) * step;
            double endStrike = Math.ceil(S * 1.1 / step) * step;

            for (double K = startStrike; K <= endStrike; K += step) {
                // Simple volatility smile
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

        // Add small bid/ask spread (1% of price or min 0.01)
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
}
