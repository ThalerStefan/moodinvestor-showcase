package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;

/**
 * Summary of a single position in the portfolio.
 *
 * symbol – Ticker symbol (e.g., BTC)
 * qty – Total quantity from vposition
 * costbasis – Weighted average price (can be null)
 * latestPrice – Last recorded price (can be null)
 * marketValue – qty * latestPrice (can be null)
 */
public class AssetSummaryDto {
    private String symbol;
    private BigDecimal qty;
    private BigDecimal costbasis;
    private BigDecimal latestPrice;
    private BigDecimal marketValue;

    public AssetSummaryDto(String symbol,
            BigDecimal qty,
            BigDecimal costbasis,
            BigDecimal latestPrice) {
        this.symbol = symbol;
        this.qty = qty;
        this.costbasis = costbasis;
        this.latestPrice = latestPrice;
        if (latestPrice != null && qty != null) {
            this.marketValue = latestPrice.multiply(qty);
        }
    }

    public String getSymbol() {
        return symbol;
    }

    public BigDecimal getQty() {
        return qty;
    }

    public BigDecimal getCostbasis() {
        return costbasis;
    }

    public BigDecimal getLatestPrice() {
        return latestPrice;
    }

    public BigDecimal getMarketValue() {
        return marketValue;
    }
}