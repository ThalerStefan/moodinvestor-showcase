package at.stefan.moodinvestor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import at.stefan.moodinvestor.model.PfgLog;
import at.stefan.moodinvestor.model.Txn;


public interface PfgLogRepository extends JpaRepository<PfgLog, Long> {

    Optional<PfgLog> findByTxn(Txn txn);

    Optional<PfgLog> findByTxn_TxnId(Long txnId);

    boolean existsByTxn_TxnId(Long txnId);

    @Query("select avg(p.pfgValue) from PfgLog p")
    Double findAveragePfg();

    @Query("select count(p) from PfgLog p")
    long countAll();

    // All PFG entries by ID descending
    @Query("select p from PfgLog p order by p.pfgLogId DESC")
    List<PfgLog> findLatest();

    /**
     * returns all PFG log entries for transactions of a given asset, ordered by
     * the associated transaction timestamp descending
     */
    @Query("select p from PfgLog p join p.txn t join t.asset a where a.assetId = :assetId order by t.timestamp desc")
    List<PfgLog> findByAssetIdOrderByTxnTimestampDesc(@Param("assetId") Long assetId);

    @Query("select p from PfgLog p join p.txn t where t.clerkUserId = :clerkUserId order by p.pfgLogId desc")
    List<PfgLog> findLatestByUser(@Param("clerkUserId") String clerkUserId);

    @Query("select p from PfgLog p join p.txn t join t.asset a where t.clerkUserId = :clerkUserId and a.assetId = :assetId order by t.timestamp desc")
    List<PfgLog> findByUserAndAssetIdOrderByTxnTimestampDesc(@Param("clerkUserId") String clerkUserId,
            @Param("assetId") Long assetId);

}
