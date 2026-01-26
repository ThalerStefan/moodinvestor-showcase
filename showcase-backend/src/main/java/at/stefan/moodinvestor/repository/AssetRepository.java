package at.stefan.moodinvestor.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import at.stefan.moodinvestor.model.Asset;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findBySymbol(String symbol);

    Optional<Asset> findByCoingeckoId(String coingeckoId);
}
