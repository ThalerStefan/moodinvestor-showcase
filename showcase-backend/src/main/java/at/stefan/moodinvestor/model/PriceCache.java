package at.stefan.moodinvestor.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Corresponds to the 'pricecache' table
 * Columns: priceCacheId, assetId, timestamp, price
 */
@Entity
@Table(name = "pricecache", uniqueConstraints = @UniqueConstraint(name = "uk_pricecache_asset_ts", columnNames = {
        "assetId", "timestamp" }), indexes = @Index(name = "idx_pricecache_asset", columnList = "assetId"))
public class PriceCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "priceCacheId")
    private Long priceCacheId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "assetId", foreignKey = @ForeignKey(name = "fk_pricecache_asset"))
    private Asset asset;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "price", nullable = false, precision = 20, scale = 8)
    private BigDecimal price;

    @Column(name = "source", length = 64)
    private String source;

    // Getter/Setter
    public Long getPriceCacheId() {
        return priceCacheId;
    }

    public Asset getAsset() {
        return asset;
    }

    public void setAsset(Asset asset) {
        this.asset = asset;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
