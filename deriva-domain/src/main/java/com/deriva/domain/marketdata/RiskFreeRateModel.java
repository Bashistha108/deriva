package com.deriva.domain.marketdata;

import com.deriva.domain.common.Percentage;
import com.deriva.domain.instrument.OptionExpiration;

public interface RiskFreeRateModel {
    /**
     * Determines the risk-free rate required for pricing given an expiration and a yield curve.
     */
    Percentage getRiskFreeRate(OptionExpiration expiration, YieldCurve curve);
}
