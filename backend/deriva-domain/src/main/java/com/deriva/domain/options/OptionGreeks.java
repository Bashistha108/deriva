package com.deriva.domain.options;

import java.math.BigDecimal;

public class OptionGreeks {
    private final BigDecimal delta;
    private final BigDecimal gamma;
    private final BigDecimal theta;
    private final BigDecimal vega;
    private final BigDecimal rho;

    public OptionGreeks(BigDecimal delta, BigDecimal gamma, BigDecimal theta, BigDecimal vega, BigDecimal rho) {
        this.delta = delta;
        this.gamma = gamma;
        this.theta = theta;
        this.vega = vega;
        this.rho = rho;
    }

    public BigDecimal getDelta() { return delta; }
    public BigDecimal getGamma() { return gamma; }
    public BigDecimal getTheta() { return theta; }
    public BigDecimal getVega() { return vega; }
    public BigDecimal getRho() { return rho; }
}
