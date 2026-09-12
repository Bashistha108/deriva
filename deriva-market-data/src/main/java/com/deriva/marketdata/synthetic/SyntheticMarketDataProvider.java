package com.deriva.marketdata.synthetic;

import com.deriva.domain.common.Symbol;
import com.deriva.domain.marketdata.MarketQuote;
import com.deriva.domain.marketdata.OptionQuote;
import com.deriva.marketdata.MarketDataProvider;
import com.deriva.marketdata.YahooFinanceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
@Primary
public class SyntheticMarketDataProvider implements MarketDataProvider {

    private final YahooFinanceService yahooService;
    private final HistoricalVolatilityCalculator volatilityCalculator;
    private final SyntheticOptionChainGenerator chainGenerator;
    private final ObjectMapper objectMapper;

    public SyntheticMarketDataProvider(YahooFinanceService yahooService,
                                       HistoricalVolatilityCalculator volatilityCalculator,
                                       SyntheticOptionChainGenerator chainGenerator) {
        this.yahooService = yahooService;
        this.volatilityCalculator = volatilityCalculator;
        this.chainGenerator = chainGenerator;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public MarketQuote getUnderlyingQuote(Symbol symbol) {
        return yahooService.getUnderlyingQuote(symbol);
    }

    @Override
    public List<OptionQuote> getOptionChain(Symbol underlyingSymbol) {
        MarketQuote spotQuote = getUnderlyingQuote(underlyingSymbol);
        List<Double> historicalPrices = yahooService.getHistoricalPrices(underlyingSymbol.value());
        
        double realizedVol = volatilityCalculator.calculate(historicalPrices);
        return chainGenerator.generateChain(underlyingSymbol, spotQuote.last().value().doubleValue(), realizedVol);
    }

    @Override
    public String getRawOptionChain(String symbol, Long date) {
        // Fallback for raw JSON requests from old UI
        try {
            MarketQuote spotQuote = getUnderlyingQuote(new Symbol(symbol));
            double spot = spotQuote.last().value().doubleValue();
            
            List<Double> historicalPrices = yahooService.getHistoricalPrices(symbol);
            double realizedVol = volatilityCalculator.calculate(historicalPrices);
            
            List<OptionQuote> quotes = chainGenerator.generateChain(new Symbol(symbol), spot, realizedVol);
            
            ObjectNode rootNode = objectMapper.createObjectNode();
            ObjectNode optionChain = rootNode.putObject("optionChain");
            ArrayNode result = optionChain.putArray("result");
            ObjectNode resultItem = result.addObject();
            resultItem.put("underlyingSymbol", symbol);
            
            ArrayNode expirationDates = resultItem.putArray("expirationDates");
            List<Long> expDates = quotes.stream()
                .map(q -> q.contract().expiration().date().atStartOfDay().toEpochSecond(ZoneOffset.UTC))
                .distinct()
                .sorted()
                .toList();
            expDates.forEach(expirationDates::add);
            
            ObjectNode quoteObj = resultItem.putObject("quote");
            quoteObj.put("regularMarketPrice", spot);
            
            ArrayNode optionsNode = resultItem.putArray("options");
            
            // Filter by requested date if any
            Long targetDate = date != null ? date : (expDates.isEmpty() ? null : expDates.get(0));
            
            if (targetDate != null) {
                ObjectNode optionItem = optionsNode.addObject();
                ArrayNode calls = optionItem.putArray("calls");
                ArrayNode puts = optionItem.putArray("puts");
                
                for (OptionQuote quote : quotes) {
                    long qDate = quote.contract().expiration().date().atStartOfDay().toEpochSecond(ZoneOffset.UTC);
                    if (qDate == targetDate) {
                        ObjectNode node = quote.contract().type().name().equals("CALL") ? calls.addObject() : puts.addObject();
                        node.put("strike", quote.contract().strike().value().doubleValue());
                        node.put("expiration", qDate);
                        node.put("bid", quote.bid().value().doubleValue());
                        node.put("ask", quote.ask().value().doubleValue());
                        node.put("lastPrice", quote.last().value().doubleValue());
                        node.put("impliedVolatility", quote.impliedVolatility().decimalValue());
                        node.put("volume", quote.volume());
                    }
                }
            }
            return objectMapper.writeValueAsString(rootNode);
        } catch (Exception e) {
            e.printStackTrace();
            return "{}";
        }
    }
}
