package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Slim DTO for prices – avoids lazy-loading issues.
 * Fields: symbol, timestamp, price, source
 */
public class PriceDto {

    private final String symbol;
    private final LocalDateTime timestamp;
    private final BigDecimal price;
    private final String source;

    public PriceDto(String symbol, LocalDateTime timestamp, BigDecimal price, String source) {
        this.symbol = symbol;
        this.timestamp = timestamp;
        this.price = price;
        this.source = source;
    }

    public String getSymbol() {
        return symbol;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getSource() {
        return source;
    }

}
