package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request payload for PUT /api/txns/{txnId}
 *
 * This class essentially mirrors CreateTxnWithPfgRequest,
 * but allows for the optional updating of the PFG data.
 * All mandatory fields of the transaction must be included.
 */
public class UpdateTxnWithPfgRequest {

    @NotBlank
    private String symbol;

    /**
     * ISO-8601 without timezone, e.g. "2025-10-08T19:00:00"
     */
    @NotBlank
    private String timestamp;

    @NotBlank
    @Pattern(regexp = "BUY|SELL", message = "side muss BUY oder SELL sein")
    private String side;

    @NotNull
    @DecimalMin(value = "0.00000001")
    private BigDecimal quantity;

    @NotNull
    @DecimalMin(value = "0.00000001")
    private BigDecimal price;

    @Size(max = 255)
    private String note;
    
    /**
     * Optional:
     * If set, exactly 5 values (1..5).
     * If null, existing PFG data remains unchanged
     * (or is handled in the service as you implement it).
     */
    @Size(min = 5, max = 5, message = "pfg muss genau 5 Werte enthalten, wenn gesetzt")
    private Byte[] pfg;

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getSide() {
        return side;
    }

    public void setSide(String side) {
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

    public Byte[] getPfg() {
        return pfg;
    }

    public void setPfg(Byte[] pfg) {
        this.pfg = pfg;
    }

}
