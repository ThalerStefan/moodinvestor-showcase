package at.stefan.moodinvestor.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Corresponds to table 'txn'
 * Columns: txnId, assetId, timestamp, side (ENUM), quantity, price
 */
@Entity
@Table(name = "txn", indexes = @Index(name = "idx_txn_asset_ts", columnList = "assetId, timestamp"))
public class Txn {

    public enum Side {
        BUY, SELL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "txnId")
    private Long txnId;

    // Foreign key: txn.assetId -> asset.assetId
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "assetId", foreignKey = @ForeignKey(name = "fk_txn_asset"))
    private Asset asset;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp; // UTC recommended

    @Enumerated(EnumType.STRING)
    @Column(name = "side", nullable = false, columnDefinition = "ENUM('BUY','SELL')")
    private Side side;

    @Column(name = "quantity", nullable = false, precision = 20, scale = 8)
    private BigDecimal quantity;

    @Column(name = "price", nullable = false, precision = 20, scale = 8)
    private BigDecimal price;

    @Column(name = "note", length = 255)
    private String note;

    @Column(name = "clerkUserId", nullable = false, length = 64)
    private String clerkUserId;

    // Getters/Setters
    public Long getTxnId() {
        return txnId;
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

    public Side getSide() {
        return side;
    }

    public void setSide(Side side) {
        this.side = side;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getClerkUserId() {
        return clerkUserId;
    }

    public void setClerkUserId(String clerkUserId) {
        this.clerkUserId = clerkUserId;
    }

    
}
