package at.stefan.moodinvestor.model;

import jakarta.persistence.*;

/**
 * Corresponds to table 'asset'
 * Columns: assetId, symbol, name, assetType (ENUM)
 */
@Entity
@Table(name = "asset", indexes = @Index(name = "idx_asset_type", columnList = "assetType"), uniqueConstraints = @UniqueConstraint(name = "uk_asset_symbol", columnNames = "symbol"))
public class Asset {

    public enum AssetType {
        CRYPTO, STOCK, ETF, METAL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assetId") // <- IMPORTANT: exactly as in DB
    private Long assetId;

    @Column(name = "symbol", nullable = false, length = 32)
    private String symbol;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "assetType", nullable = false, columnDefinition = "ENUM('CRYPTO','STOCK','ETF','METAL')")
    private AssetType assetType;

    @Column(name = "coingeckoId", length = 255)
    private String coingeckoId;

    @Column(name = "cmcUrl", length = 255)
    private String cmcUrl;

    @Column(name = "imageUrl", length = 255)
    private String imageUrl;

    // Getters/Setters
    public Long getAssetId() {
        return assetId;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AssetType getAssetType() {
        return assetType;
    }

    public void setAssetType(AssetType assetType) {
        this.assetType = assetType;
    }

    public String getCoingeckoId() {
        return coingeckoId;
    }

    public void setCoingeckoId(String coingeckoId) {
        this.coingeckoId = coingeckoId;
    }

    public String getCmcUrl() {
        return cmcUrl;
    }

    public void setCmcUrl(String cmcUrl) {
        this.cmcUrl = cmcUrl;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

}
