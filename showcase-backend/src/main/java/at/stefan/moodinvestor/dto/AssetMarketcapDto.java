package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;

public class AssetMarketcapDto {

    private final Long assetId;
    private final String symbol;
    private final String name;
    private final BigDecimal price;
    private final Double change24h;
    private final Double change7d;
    private final BigDecimal marketcap;
    
    public AssetMarketcapDto(Long assetId, String symbol, String name, BigDecimal price, Double change24h,
            Double change7d, BigDecimal marketcap) {
        this.assetId = assetId;
        this.symbol = symbol;
        this.name = name;
        this.price = price;
        this.change24h = change24h;
        this.change7d = change7d;
        this.marketcap = marketcap;
    }

    public Long getAssetId() {
        return assetId;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Double getChange24h() {
        return change24h;
    }

    public Double getChange7d() {
        return change7d;
    }

    public BigDecimal getMarketcap() {
        return marketcap;
    }

    
}
