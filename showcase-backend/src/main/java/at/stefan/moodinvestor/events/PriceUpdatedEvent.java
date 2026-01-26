package at.stefan.moodinvestor.events;

import java.math.BigDecimal;

public record PriceUpdatedEvent(String symbol, BigDecimal price, String source) {}
