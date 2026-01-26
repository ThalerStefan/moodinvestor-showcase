package at.stefan.moodinvestor.model;

import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "vpositionuser")
public class PositionView {

    @EmbeddedId
    private PositionKey id;
    
    @Column(name="qty")
    private BigDecimal qty;

    @Column(name="costbasis")
    private BigDecimal costbasis;

    public PositionKey getId() {
        return id;
    }

    public void setId(PositionKey id) {
        this.id = id;
    }

    public BigDecimal getQty() {
        return qty;
    }

    public void setQty(BigDecimal qty) {
        this.qty = qty;
    }

    public BigDecimal getCostbasis() {
        return costbasis;
    }

    public void setCostbasis(BigDecimal costbasis) {
        this.costbasis = costbasis;
    }

    public String getClerkUserId() {
        return id != null ? id.getClerkUserId() : null;
    }

    public String getSymbol() {
        return id != null ? id.getSymbol() : null;
    }
  
}
