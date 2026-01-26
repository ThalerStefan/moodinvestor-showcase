package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record PriceUpdateDto(
    String symbol,
    BigDecimal price,
    Instant timestamo,
    String source
) {}
