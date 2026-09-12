package com.deriva.marketdata.synthetic;

import com.deriva.domain.common.Percentage;
import com.deriva.domain.common.Price;
import com.deriva.domain.instrument.OptionContract;
import com.deriva.domain.marketdata.OptionQuote;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class SyntheticQuoteModel {

    @Value("${synthetic.spread.min:0.05}")
    private double minSpread;

    @Value("${synthetic.spread.percentage:0.02}")
    private double spreadPercentage;

    public OptionQuote createQuote(OptionContract contract, double theoreticalPrice, double iv, double delta, double gamma, double theta, double vega, double rho) {
        
        // Spread calculation
        double spread = minSpread + (theoreticalPrice * spreadPercentage);
        
        double bid = theoreticalPrice - spread / 2.0;
        double ask = theoreticalPrice + spread / 2.0;

        // Clamping bid/ask
        bid = Math.max(0.0, bid);
        if (ask <= bid) {
            ask = bid + minSpread;
        }

        // Adjusting Vega and Theta for standard presentation
        double scaledVega = vega / 100.0;
        double dailyTheta = theta / 365.0;

        return new OptionQuote(
                contract,
                new Price(BigDecimal.valueOf(bid).setScale(4, RoundingMode.HALF_UP)),
                new Price(BigDecimal.valueOf(ask).setScale(4, RoundingMode.HALF_UP)),
                new Price(BigDecimal.valueOf(theoreticalPrice).setScale(4, RoundingMode.HALF_UP)),
                (long) (Math.random() * 500) + 50, // Synthetic volume
                new Percentage(iv),
                BigDecimal.valueOf(delta).setScale(4, RoundingMode.HALF_UP),
                BigDecimal.valueOf(gamma).setScale(4, RoundingMode.HALF_UP),
                BigDecimal.valueOf(dailyTheta).setScale(4, RoundingMode.HALF_UP),
                BigDecimal.valueOf(scaledVega).setScale(4, RoundingMode.HALF_UP),
                BigDecimal.valueOf(rho).setScale(4, RoundingMode.HALF_UP)
        );
    }
}
