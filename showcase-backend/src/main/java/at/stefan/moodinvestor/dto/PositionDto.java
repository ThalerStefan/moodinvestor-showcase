package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Return model for /api/positions.
 * - costbasis can be NULL -> then the field will be omitted
 * (JsonInclude.NON_NULL)
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PositionDto {
    private String symbol;
    private BigDecimal qty;
    private BigDecimal costbasis;

    public PositionDto(String symbol, BigDecimal qty, BigDecimal costbasis) {
        this.symbol = symbol;
        this.qty = qty;
        this.costbasis = costbasis;
    }

    public String getSymbol() {
        return symbol;
    }

    public BigDecimal getQty() {
        return qty;
    }

    public BigDecimal getCostbasis() {
        return costbasis;
    }

}
