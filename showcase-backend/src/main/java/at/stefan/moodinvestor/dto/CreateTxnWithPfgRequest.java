package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.*;

/**
 * Request-Payload for POST /api/txns mit PFG-Daten
 * - symbol: Asset-Symbol
 * - timestamp: ISO-8601 ohne Zeitzone, z. B. "2025-10-08T19:00:00"
 * - side: BUY oder SELL
 * - quantity/price: > 0
 * - note: optional
 * - pfg:5 answers (1..5), order = Q1..Q5
 */
public class CreateTxnWithPfgRequest {


    @NotBlank
    private String symbol;

    @NotBlank
    private String timestamp;

    @NotBlank
    @Pattern(regexp="BUY|SELL", message="side muss BUY oder SELL sein")
    private String side; 

    @NotNull
    @DecimalMin(value = "0.00000001")
    private BigDecimal quantity;

    @NotNull
    @DecimalMin(value = "0.00000001")
    private BigDecimal price;

    @Size(max = 255)
    private String note;

    @NotNull
    @Size(min = 5, max = 5, message = "pfg muss genau 5 Werte enthalten")
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
