package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;


public class TxnDto {

    private Long txnId;
    private String symbol;
    private String timestamp;
    private String side;
    private BigDecimal quantity;
    private BigDecimal price;
    private String note;
    private Byte pfgValue;
    private Byte[] pfgAnswers;

    public Long getTxnId() {
        return txnId;
    }

    public void setTxnId(Long txnId) {
        this.txnId = txnId;
    }

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

    public Byte getPfgValue() {
        return pfgValue;
    }

    public void setPfgValue(Byte pfgValue) {
        this.pfgValue = pfgValue;
    }

    public Byte[] getPfgAnswers() {
        return pfgAnswers;
    }

    public void setPfgAnswers(Byte[] pfgAnswers) {
        this.pfgAnswers = pfgAnswers;
    }

    

}
