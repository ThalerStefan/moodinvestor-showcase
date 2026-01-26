package at.stefan.moodinvestor.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import at.stefan.moodinvestor.model.Asset;
import at.stefan.moodinvestor.model.CirculatingSupply;

public interface CirculatingSupplyRepository extends JpaRepository<CirculatingSupply, Long> {

    // Returns the latest circulating supply entry (highest timestamp)
    Optional<CirculatingSupply> findTopByAssetOrderByTimestampDesc(Asset asset);

    // Variant via symbol
    Optional<CirculatingSupply> findTopByAsset_SymbolOrderByTimestampDesc(String symbol);

    // Returns all circulating supply entries for a specific asset, sorted
    // in descending order by timestamp
    List<CirculatingSupply> findByAssetOrderByTimestampDesc(Asset asset);

    // Check if an entry already exists for the current day
    boolean existsByTimestampBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Returns all asset IDs that already have at least one circulating supply entry
     * in the given time window.
     */
    @Query("select distinct cs.asset.id from CirculatingSupply cs where cs.timestamp >= :start and cs.timestamp < :end")
    List<Long> findAssetIdsWithSupplyBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

}
