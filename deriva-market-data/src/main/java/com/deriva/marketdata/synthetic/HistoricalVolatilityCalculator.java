package com.deriva.marketdata.synthetic;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class HistoricalVolatilityCalculator {

    private static final int TRADING_DAYS_PER_YEAR = 252;

    public double calculate(List<Double> historicalPrices) {
        if (historicalPrices == null || historicalPrices.size() < 2) {
            return 0.20; // fallback default 20%
        }

        double sumReturns = 0.0;
        double[] returns = new double[historicalPrices.size() - 1];

        for (int i = 1; i < historicalPrices.size(); i++) {
            double p0 = historicalPrices.get(i - 1);
            double p1 = historicalPrices.get(i);
            if (p0 <= 0 || p1 <= 0) {
                continue; // skip invalid prices
            }
            double r = Math.log(p1 / p0);
            returns[i - 1] = r;
            sumReturns += r;
        }

        double meanReturn = sumReturns / returns.length;
        double sumSquaredDeviations = 0.0;

        for (double r : returns) {
            double deviation = r - meanReturn;
            sumSquaredDeviations += (deviation * deviation);
        }

        double variance = sumSquaredDeviations / (returns.length - 1);
        double dailyVolatility = Math.sqrt(variance);

        return dailyVolatility * Math.sqrt(TRADING_DAYS_PER_YEAR);
    }
}
