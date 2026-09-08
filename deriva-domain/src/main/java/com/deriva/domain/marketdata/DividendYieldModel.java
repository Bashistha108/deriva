package com.deriva.domain.marketdata;

import com.deriva.domain.common.Percentage;
import com.deriva.domain.instrument.Underlying;

public interface DividendYieldModel {
    /**
     * Determines the annualized continuous dividend yield for a given underlying.
     */
    Percentage getDividendYield(Underlying underlying);
}
