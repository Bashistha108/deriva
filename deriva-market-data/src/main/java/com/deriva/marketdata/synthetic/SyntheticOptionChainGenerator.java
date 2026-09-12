package com.deriva.marketdata.synthetic;

import com.deriva.domain.common.Symbol;
import com.deriva.domain.instrument.OptionContract;
import com.deriva.domain.instrument.OptionExpiration;
import com.deriva.domain.instrument.OptionType;
import com.deriva.domain.instrument.Underlying;
import com.deriva.domain.marketdata.OptionQuote;
import com.deriva.domain.common.Price;
import com.deriva.quant.pricing.BlackScholes;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
public class SyntheticOptionChainGenerator {

    private final SyntheticIVModel ivModel;
    private final SyntheticQuoteModel quoteModel;

    @Value("${synthetic.riskFreeRate:0.05}")
    private double riskFreeRate;

    @Value("${synthetic.dividendYield:0.0}")
    private double dividendYield;

    public SyntheticOptionChainGenerator(SyntheticIVModel ivModel, SyntheticQuoteModel quoteModel) {
        this.ivModel = ivModel;
        this.quoteModel = quoteModel;
    }

    public List<OptionQuote> generateChain(Symbol underlyingSymbol, double spotPrice, double historicalVolatility) {
        List<OptionQuote> chain = new ArrayList<>();
        Underlying underlying = new Underlying(underlyingSymbol, underlyingSymbol.value(), "SYNTHETIC");
        
        int[] expirationsDTE = {7, 14, 30, 45, 60, 90};
        LocalDate today = LocalDate.now();

        double step = Math.round(spotPrice * 0.01);
        if (step < 1) step = 1;
        
        double startStrike = Math.floor(spotPrice * 0.9 / step) * step;
        double endStrike = Math.ceil(spotPrice * 1.1 / step) * step;

        for (int dte : expirationsDTE) {
            LocalDate expirationDate = today.plusDays(dte);
            
            // Avoid weekends
            if (expirationDate.getDayOfWeek() == DayOfWeek.SATURDAY) {
                expirationDate = expirationDate.plusDays(6); // Move to Friday
            } else if (expirationDate.getDayOfWeek() == DayOfWeek.SUNDAY) {
                expirationDate = expirationDate.plusDays(5); // Move to Friday
            }
            
            OptionExpiration expiration = new OptionExpiration(expirationDate);
            
            // Actual DTE in years
            double tYears = ChronoUnit.DAYS.between(today, expirationDate) / 365.0;
            if (tYears <= 0) tYears = 0.001; // Avoid divide by zero

            for (double k = startStrike; k <= endStrike; k += step) {
                double iv = ivModel.calculateIV(historicalVolatility, spotPrice, k, tYears);

                // Call
                OptionQuote callQuote = buildQuote(underlying, OptionType.CALL, spotPrice, k, tYears, iv, expiration);
                chain.add(callQuote);

                // Put
                OptionQuote putQuote = buildQuote(underlying, OptionType.PUT, spotPrice, k, tYears, iv, expiration);
                chain.add(putQuote);
            }
        }
        return chain;
    }

    private OptionQuote buildQuote(Underlying underlying, OptionType type, double s, double k, double t, double iv, OptionExpiration expiration) {
        OptionContract contract = new OptionContract(underlying, type, new Price(BigDecimal.valueOf(k)), expiration, 100);

        double theoreticalPrice = type == OptionType.CALL
                ? BlackScholes.callPrice(s, k, t, riskFreeRate, dividendYield, iv)
                : BlackScholes.putPrice(s, k, t, riskFreeRate, dividendYield, iv);

        double delta = type == OptionType.CALL
                ? BlackScholes.callDelta(s, k, t, riskFreeRate, dividendYield, iv)
                : BlackScholes.putDelta(s, k, t, riskFreeRate, dividendYield, iv);

        double gamma = BlackScholes.gamma(s, k, t, riskFreeRate, dividendYield, iv);
        double vega = BlackScholes.vega(s, k, t, riskFreeRate, dividendYield, iv);
        
        double theta = type == OptionType.CALL
                ? BlackScholes.callTheta(s, k, t, riskFreeRate, dividendYield, iv)
                : BlackScholes.putTheta(s, k, t, riskFreeRate, dividendYield, iv);

        double rho = type == OptionType.CALL
                ? BlackScholes.callRho(s, k, t, riskFreeRate, dividendYield, iv)
                : BlackScholes.putRho(s, k, t, riskFreeRate, dividendYield, iv);

        return quoteModel.createQuote(contract, theoreticalPrice, iv, delta, gamma, theta, vega, rho);
    }
}
