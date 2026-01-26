package at.stefan.moodinvestor.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import at.stefan.moodinvestor.model.PriceCache;

public interface PriceCacheRepository extends JpaRepository<PriceCache, Long> {

        /**
         * Returns the latest price entry for a given asset symbol
         * (uses the relationship asset.symbol).
         */
        Optional<PriceCache> findTopByAsset_SymbolOrderByTimestampDesc(String symbol);

        /**
         * Returns the price history for a symbol from 'from' (inclusive),
         * ordered by timestamp descending.
         */
        List<PriceCache> findByAsset_SymbolAndTimestampGreaterThanEqualOrderByTimestampDesc(
                        String symbol, LocalDateTime from);

        /**
         * Returns the complete price history for a symbol, ordered by timestamp
         * descending.
         */
        List<PriceCache> findByAsset_SymbolOrderByTimestampDesc(String symbol);

        /**
         * Returns the latest price entry before or at the given timestamp for the
         * symbol.
         */
        Optional<PriceCache> findTopByAsset_SymbolAndTimestampLessThanEqualOrderByTimestampDesc(
                        String symbol, LocalDateTime timestamp);

        /**
         * Fetches the latest price entry for each asset symbol.
         */
        @Query("""
                        SELECT pc
                        FROM PriceCache pc
                        JOIN FETCH pc.asset a
                        WHERE pc.timestamp = (
                            SELECT MAX(pc2.timestamp)
                            FROM PriceCache pc2
                            WHERE pc2.asset.symbol = a.symbol
                        )
                        """)
        List<PriceCache> findLatestPricesPerSymbol();

        /**
         * Returns the latest price entry before or at a given timestamp for every
         * symbol
         * in the provided collection.
         */
        @Query("""
                        SELECT pc
                        FROM PriceCache pc
                        JOIN FETCH pc.asset a
                        WHERE a.symbol IN :symbols
                          AND pc.timestamp = (
                              SELECT MAX(pc2.timestamp)
                              FROM PriceCache pc2
                              WHERE pc2.asset.symbol = a.symbol
                                AND pc2.timestamp <= :start
                          )
                        """)
        List<PriceCache> findLatestPriceBefore(List<String> symbols, LocalDateTime start);

        /**
         * Fetches all price entries for the given set of symbols starting from the
         * specified
         * timestamp (inclusive). Results are ordered by symbol and timestamp ascending.
         */
        @Query("""
                        SELECT pc
                        FROM PriceCache pc
                        JOIN FETCH pc.asset a
                        WHERE a.symbol IN :symbols
                          AND pc.timestamp >= :start
                        ORDER BY a.symbol ASC, pc.timestamp ASC
                        """)
        List<PriceCache> findAllBySymbolsAndTimestampFrom(List<String> symbols, LocalDateTime start);
}
