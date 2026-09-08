package com.deriva.domain.marketdata;

import com.deriva.domain.common.Percentage;
import java.time.LocalDate;

public interface YieldCurve {
    /**
     * Get the interpolated or constant interest rate for a given target date.
     */
    Percentage getRate(LocalDate targetDate);
}
