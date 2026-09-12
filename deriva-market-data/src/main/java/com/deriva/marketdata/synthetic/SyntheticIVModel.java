package com.deriva.marketdata.synthetic;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SyntheticIVModel {

    @Value("${synthetic.volatility.premium:1.10}")
    private double premiumMultiplier;

    @Value("${synthetic.volatility.min:0.01}")
    private double minIV;

    @Value("${synthetic.volatility.max:3.00}")
    private double maxIV;

    @Value("${synthetic.volatility.termSlope:0.05}")
    private double termSlope;

    @Value("${synthetic.volatility.skew:-0.1}")
    private double skew;

    @Value("${synthetic.volatility.curvature:0.05}")
    private double curvature;

    public double calculateIV(double historicalVolatility, double spotPrice, double strikePrice, double yearsToExpiry) {
        double baseIV = historicalVolatility * premiumMultiplier;
        
        // Term structure effect
        double termAdjustment = termSlope * Math.exp(-yearsToExpiry);
        
        // Skew and smile effect
        double m = Math.log(strikePrice / spotPrice);
        double skewAdjustment = skew * m;
        double smileAdjustment = curvature * m * m;

        double calculatedIV = baseIV + termAdjustment + skewAdjustment + smileAdjustment;

        // Clamp
        return Math.min(Math.max(calculatedIV, minIV), maxIV);
    }
}
