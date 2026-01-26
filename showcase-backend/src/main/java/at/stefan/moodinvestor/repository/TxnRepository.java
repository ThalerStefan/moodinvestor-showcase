package at.stefan.moodinvestor.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import at.stefan.moodinvestor.model.Txn;

public interface TxnRepository extends JpaRepository<Txn, Long> {


    Optional<Txn> findTopByAsset_SymbolOrderByTimestampDesc(String symbol);

    @Query("""
            select t
            from Txn t
              join fetch t.asset a
            order by t.timestamp desc
            """)
    List<Txn> findAllFetchAssetOrderByTimestampDesc();

    @Query("""
            select t
            from Txn t
              join fetch t.asset a
            where a.assetId = :assetId
            order by t.timestamp desc
            """)
    List<Txn> findByAssetIdFetchAssetOrderByTimestampDesc(@Param("assetId") Long assetId);


    Optional<Txn> findByTxnIdAndClerkUserId(Long txnId, String clerkUserId);

    Optional<Txn> findTopByClerkUserIdAndAsset_SymbolOrderByTimestampDesc(String clerkUserId, String symbol);

    @Query("""
          select t from Txn t join fetch t.asset a
          where t.clerkUserId = :clerkUserId
          order by t.timestamp desc
        """)
    List<Txn> findAllFetchAssetByUserOrderByTimestampDesc(@Param("clerkUserId") String clerkUserId);

    @Query("""
          select t
          from Txn t
          join fetch t.asset a
          where t.clerkUserId = :clerkUserId
           and a.assetId = :assetId
          order by t.timestamp desc
        """)
    List<Txn> findByAssetIdFetchAssetByUserOrderByTimestampDesc(
      @Param("clerkUserId") String clerkUserId,
      @Param("assetId") Long assetId);

}
