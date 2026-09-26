package com.deriva.api.dto;

import java.math.BigDecimal;

public class OptionsChainRowDTO {
    private double strike;
    
    private BigDecimal callBid;
    private BigDecimal callAsk;
    private BigDecimal callDelta;
    private BigDecimal callGamma;
    private BigDecimal callTheta;
    private BigDecimal callVega;
    private int callVol;
    private int callOI;
    private String callIV;

    private BigDecimal putBid;
    private BigDecimal putAsk;
    private BigDecimal putDelta;
    private BigDecimal putGamma;
    private BigDecimal putTheta;
    private BigDecimal putVega;
    private int putVol;
    private int putOI;
    private String putIV;

    // Getters and Setters

    public double getStrike() { return strike; }
    public void setStrike(double strike) { this.strike = strike; }

    public BigDecimal getCallBid() { return callBid; }
    public void setCallBid(BigDecimal callBid) { this.callBid = callBid; }

    public BigDecimal getCallAsk() { return callAsk; }
    public void setCallAsk(BigDecimal callAsk) { this.callAsk = callAsk; }

    public BigDecimal getCallDelta() { return callDelta; }
    public void setCallDelta(BigDecimal callDelta) { this.callDelta = callDelta; }

    public BigDecimal getCallGamma() { return callGamma; }
    public void setCallGamma(BigDecimal callGamma) { this.callGamma = callGamma; }

    public BigDecimal getCallTheta() { return callTheta; }
    public void setCallTheta(BigDecimal callTheta) { this.callTheta = callTheta; }

    public BigDecimal getCallVega() { return callVega; }
    public void setCallVega(BigDecimal callVega) { this.callVega = callVega; }

    public int getCallVol() { return callVol; }
    public void setCallVol(int callVol) { this.callVol = callVol; }

    public int getCallOI() { return callOI; }
    public void setCallOI(int callOI) { this.callOI = callOI; }

    public String getCallIV() { return callIV; }
    public void setCallIV(String callIV) { this.callIV = callIV; }

    public BigDecimal getPutBid() { return putBid; }
    public void setPutBid(BigDecimal putBid) { this.putBid = putBid; }

    public BigDecimal getPutAsk() { return putAsk; }
    public void setPutAsk(BigDecimal putAsk) { this.putAsk = putAsk; }

    public BigDecimal getPutDelta() { return putDelta; }
    public void setPutDelta(BigDecimal putDelta) { this.putDelta = putDelta; }

    public BigDecimal getPutGamma() { return putGamma; }
    public void setPutGamma(BigDecimal putGamma) { this.putGamma = putGamma; }

    public BigDecimal getPutTheta() { return putTheta; }
    public void setPutTheta(BigDecimal putTheta) { this.putTheta = putTheta; }

    public BigDecimal getPutVega() { return putVega; }
    public void setPutVega(BigDecimal putVega) { this.putVega = putVega; }

    public int getPutVol() { return putVol; }
    public void setPutVol(int putVol) { this.putVol = putVol; }

    public int getPutOI() { return putOI; }
    public void setPutOI(int putOI) { this.putOI = putOI; }

    public String getPutIV() { return putIV; }
    public void setPutIV(String putIV) { this.putIV = putIV; }
}
