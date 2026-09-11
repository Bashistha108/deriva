package com.deriva.marketdata;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.deriva.domain.common.Symbol;
import com.deriva.domain.marketdata.MarketQuote;
import com.deriva.domain.instrument.OptionContract;
import com.deriva.domain.marketdata.OptionQuote;
import com.deriva.domain.instrument.OptionType;
import com.deriva.domain.instrument.Underlying;
import com.deriva.domain.exception.MarketDataException;
import com.deriva.infrastructure.persistence.marketdata.MarketDataCacheEntity;
import com.deriva.infrastructure.persistence.marketdata.MarketDataCacheRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.deriva.domain.common.Price;

@Service
public class YahooFinanceService implements MarketDataProvider {

    private static final Logger log = LoggerFactory.getLogger(YahooFinanceService.class);

    private final MarketDataCacheRepository cacheRepository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String yahooApiUrl;

    public YahooFinanceService(MarketDataCacheRepository cacheRepository,
                               @Value("${yahoo.api.url:https://query1.finance.yahoo.com/v7/finance/options}") String yahooApiUrl) {
        this.cacheRepository = cacheRepository;
        this.yahooApiUrl = yahooApiUrl;
        this.objectMapper = new ObjectMapper();
        this.restClient = RestClient.builder()
                .baseUrl(this.yahooApiUrl)
                .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    private String cookie = null;
    private String crumb = null;

    private synchronized void refreshCrumbAndCookie() {
        try {
            log.info("Fetching new Yahoo cookie and crumb...");
            // 1. Fetch cookie
            RestClient cookieClient = RestClient.builder()
                    .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .build();
            var cookieResponse = cookieClient.get()
                    .uri("https://fc.yahoo.com/")
                    .retrieve()
                    .toBodilessEntity();
            
            List<String> setCookies = cookieResponse.getHeaders().get(HttpHeaders.SET_COOKIE);
            if (setCookies != null && !setCookies.isEmpty()) {
                for (String c : setCookies) {
                    if (c.startsWith("A3=")) {
                        this.cookie = c.split(";")[0];
                        break;
                    }
                }
            }

            // 2. Fetch crumb
            if (this.cookie != null) {
                this.crumb = cookieClient.get()
                        .uri("https://query1.finance.yahoo.com/v1/test/getcrumb")
                        .header(HttpHeaders.COOKIE, this.cookie)
                        .retrieve()
                        .body(String.class);
            }
            log.info("Successfully fetched Yahoo crumb");
        } catch (Exception e) {
            log.error("Failed to fetch Yahoo crumb/cookie", e);
        }
    }

    private JsonNode fetchFromYahoo(String ticker, Long date) {
        if (crumb == null || cookie == null) {
            refreshCrumbAndCookie();
        }
        
        try {
            String url = "/{ticker}?crumb=" + (crumb != null ? crumb : "");
            if (date != null) {
                url += "&date=" + date;
            }
            String response = restClient.method(HttpMethod.GET)
                    .uri(url, ticker)
                    .header(HttpHeaders.COOKIE, cookie != null ? cookie : "")
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            
            // Save to Cache only if it's the base query (no date)
            if (date == null) {
                MarketDataCacheEntity cache = MarketDataCacheEntity.builder()
                        .ticker(ticker)
                        .optionsData(response)
                        .lastUpdatedAt(Instant.now())
                        .build();
                cacheRepository.save(cache);
            }
            
            return root;
        } catch (Exception e) {
            // If unauthorized, maybe crumb expired
            if (e.getMessage() != null && e.getMessage().contains("401")) {
                log.warn("Unauthorized from Yahoo, refreshing crumb and retrying...");
                refreshCrumbAndCookie();
                // Simple retry
                return fetchFromYahooRetry(ticker, date);
            }
            return fallbackToCache(ticker, date, e);
        }
    }

    private JsonNode fetchFromYahooRetry(String ticker, Long date) {
        try {
            String url = "/{ticker}?crumb=" + (crumb != null ? crumb : "");
            if (date != null) {
                url += "&date=" + date;
            }
            String response = restClient.method(HttpMethod.GET)
                    .uri(url, ticker)
                    .header(HttpHeaders.COOKIE, cookie != null ? cookie : "")
                    .retrieve()
                    .body(String.class);
            return objectMapper.readTree(response);
        } catch (Exception e) {
            return fallbackToCache(ticker, date, e);
        }
    }

    private JsonNode fallbackToCache(String ticker, Long date, Exception originalException) {
        log.error("Failed to fetch from Yahoo API for {}: {}", ticker, originalException.getMessage());
        if (date == null) {
            Optional<MarketDataCacheEntity> cached = cacheRepository.findById(ticker);
            if (cached.isPresent()) {
                try {
                    log.info("Falling back to cached data for {}", ticker);
                    return objectMapper.readTree(cached.get().getOptionsData());
                } catch (Exception ex) {
                    throw new MarketDataException("Failed to parse cached data", ex);
                }
            }
        }
        throw new MarketDataException("No data available for " + ticker + (date != null ? " on date " + date : ""), originalException);
    }

    @Override
    public MarketQuote getUnderlyingQuote(Symbol symbol) {
        JsonNode root = fetchFromYahoo(symbol.value(), null);
        BigDecimal price = extractPrice(root);
        return new MarketQuote(symbol, new Price(price), new Price(price), new Price(price), 0); // simplified bid/ask
    }

    @Override
    public List<OptionQuote> getOptionChain(Symbol underlyingSymbol) {
        JsonNode root = fetchFromYahoo(underlyingSymbol.value(), null);
        return extractOptionChain(root, underlyingSymbol);
    }
    
    @Override
    public String getRawOptionChain(String symbol, Long date) {
        JsonNode root = fetchFromYahoo(symbol, date);
        try {
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new MarketDataException("Failed to serialize option chain for " + symbol, e);
        }
    }

    private BigDecimal extractPrice(JsonNode root) {
        try {
            return new BigDecimal(root.path("optionChain").path("result").get(0).path("quote").path("regularMarketPrice").asText());
        } catch (Exception e) {
            log.error("Failed to extract price: {}", e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    private List<OptionQuote> extractOptionChain(JsonNode root, Symbol underlyingSymbol) {
        List<OptionQuote> quotes = new ArrayList<>();
        try {
            JsonNode options = root.path("optionChain").path("result").get(0).path("options").get(0);
            
            // Calls
            JsonNode calls = options.path("calls");
            if (calls.isArray()) {
                for (JsonNode call : calls) {
                    quotes.add(parseQuote(call, underlyingSymbol, OptionType.CALL));
                }
            }

            // Puts
            JsonNode puts = options.path("puts");
            if (puts.isArray()) {
                for (JsonNode put : puts) {
                    quotes.add(parseQuote(put, underlyingSymbol, OptionType.PUT));
                }
            }
        } catch (Exception e) {
            log.error("Failed to extract option chain: {}", e.getMessage());
        }
        return quotes;
    }

    private OptionQuote parseQuote(JsonNode node, Symbol underlyingSymbol, OptionType type) {
        long expirationTs = node.path("expiration").asLong();
        LocalDate expirationDate = Instant.ofEpochSecond(expirationTs).atZone(ZoneId.of("UTC")).toLocalDate();
        BigDecimal strike = new BigDecimal(node.path("strike").asText());
        
        OptionContract contract = new OptionContract(
            new com.deriva.domain.instrument.Underlying(underlyingSymbol, "", ""),
            type,
            new Price(strike),
            new com.deriva.domain.instrument.OptionExpiration(expirationDate),
            100
        );

        BigDecimal bid = node.path("bid").isMissingNode() ? BigDecimal.ZERO : new BigDecimal(node.path("bid").asText());
        BigDecimal ask = node.path("ask").isMissingNode() ? BigDecimal.ZERO : new BigDecimal(node.path("ask").asText());
        BigDecimal last = node.path("lastPrice").isMissingNode() ? BigDecimal.ZERO : new BigDecimal(node.path("lastPrice").asText());
        long volume = node.path("volume").isMissingNode() ? 0 : node.path("volume").asLong();
        double iv = node.path("impliedVolatility").isMissingNode() ? 0.0 : node.path("impliedVolatility").asDouble();

        return new OptionQuote(
            contract,
            new Price(bid),
            new Price(ask),
            new Price(last),
            volume,
            new com.deriva.domain.common.Percentage(iv),
            // Mock Greeks for now until Deriva-Quant handles it
            new BigDecimal("0.5"), new BigDecimal("0.05"), new BigDecimal("-0.1"), new BigDecimal("0.2"), new BigDecimal("0.02")
        );
    }
}
