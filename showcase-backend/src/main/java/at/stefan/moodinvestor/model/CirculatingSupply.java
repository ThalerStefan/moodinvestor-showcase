package at.stefan.moodinvestor.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "circulatingsupply", uniqueConstraints = @UniqueConstraint(name = "uk_circulating_supply_asset_ts", columnNames = {
        "assetId", "timestamp" }))
public class CirculatingSupply {

    // Primarykey
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "circulatingSupplyId")
    private Long circulatingSupplyId;

    // Foreignkey
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "assetId", foreignKey = @ForeignKey(name = "fk_circulatingSupply_asset"))
    private Asset asset;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "supply", nullable = false, precision = 38, scale = 8)
    private BigDecimal supply;

    public Long getCirculatingSupplyId() {
        return circulatingSupplyId;
    }

    public void setCirculatingSupplyId(Long circulatingSupplyId) {
        this.circulatingSupplyId = circulatingSupplyId;
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

    public BigDecimal getSupply() {
        return supply;
    }

    public void setSupply(BigDecimal supply) {
        this.supply = supply;
    }

}
