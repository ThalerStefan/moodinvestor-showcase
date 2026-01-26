package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * WebSocket payload for updating ONE asset row in the dashboard table
 * Sent whenever a price actually changed (AFTER_COMMIT)
 */
public record AssetRowUpdateDto(
        String symbol,
        BigDecimal price,
        Double change24h,
        Double change7d,
        BigDecimal marketcap,
        Instant timestamp,
        String source) {
}
