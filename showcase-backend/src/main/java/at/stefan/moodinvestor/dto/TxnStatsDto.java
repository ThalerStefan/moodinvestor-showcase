package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;

public class TxnStatsDto {

    private final Long assetId;
    private final String symbol;
    private final BigDecimal currentPrice;
    private final Double weightedPfg;
    private final BigDecimal currentQuantity;
    private final BigDecimal averageBuyPrice;
    
    public TxnStatsDto(Long assetId, String symbol, BigDecimal currentPrice, Double weightedPfg,
            BigDecimal currentQuantity, BigDecimal averageBuyPrice) {
        this.assetId = assetId;
        this.symbol = symbol;
        this.currentPrice = currentPrice;
        this.weightedPfg = weightedPfg;
        this.currentQuantity = currentQuantity;
        this.averageBuyPrice = averageBuyPrice;
    }

    public Long getAssetId() {
        return assetId;
    }

    public String getSymbol() {
        return symbol;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public Double getWeightedPfg() {
        return weightedPfg;
    }

    public BigDecimal getCurrentQuantity() {
        return currentQuantity;
    }

    public BigDecimal getAverageBuyPrice() {
        return averageBuyPrice;
    }

    
}
