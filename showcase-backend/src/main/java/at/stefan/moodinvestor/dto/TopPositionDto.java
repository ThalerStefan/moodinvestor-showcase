package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;

public class TopPositionDto {

    private final String symbol;
    private final String name;
    private final BigDecimal quantity;
    private final BigDecimal value;
    
    public TopPositionDto(String symbol, String name, BigDecimal quantity, BigDecimal value) {
        this.symbol = symbol;
        this.name = name;
        this.quantity = quantity;
        this.value = value;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getValue() {
        return value;
    }

    

}
