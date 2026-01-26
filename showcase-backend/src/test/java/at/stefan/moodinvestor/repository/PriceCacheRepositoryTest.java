package at.stefan.moodinvestor.repository;

import at.stefan.moodinvestor.model.Asset;
import at.stefan.moodinvestor.model.PriceCache;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(showSql = false)
@ActiveProfiles("test")

// IMPORTANT: we provide the H2 URL ourselves → Spring should NOT replace it
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)

// All required properties ONLY for this test class:
@TestPropertySource(properties = {
        // Own, isolated H2 database in MySQL mode (with NON_KEYWORDS=DAY)
        "spring.datasource.url=jdbc:h2:mem:moodinvestor_repo;MODE=MySQL;NON_KEYWORDS=DAY;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",

        // Create schema securely and drop it again after the test
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.hbm2ddl.auto=create-drop",

        // (optional) Reduce log noise
        "logging.level.org.hibernate.SQL=WARN"
})
class PriceCacheRepositoryTest {

    @Autowired
    AssetRepository assetRepository;
    @Autowired
    PriceCacheRepository priceCacheRepository;

    @Test
    void latest_and_history() {
        Asset a = new Asset();
        a.setSymbol("BTC");
        a.setName("Bitcoin");
        a.setAssetType(Asset.AssetType.CRYPTO);
        assetRepository.save(a);

        insert(a, "2025-10-15T09:00:00", "65000");
        insert(a, "2025-10-15T10:00:00", "65100");

        var latest = priceCacheRepository.findTopByAsset_SymbolOrderByTimestampDesc("BTC");
        assertTrue(latest.isPresent());
        assertEquals(new BigDecimal("65100"), latest.get().getPrice());

        List<PriceCache> hist = priceCacheRepository.findByAsset_SymbolAndTimestampGreaterThanEqualOrderByTimestampDesc(
                "BTC", LocalDateTime.parse("2025-10-15T09:00:00"));
        assertEquals(2, hist.size());
        assertTrue(hist.get(0).getTimestamp().isAfter(hist.get(1).getTimestamp()));
    }

    private void insert(Asset a, String ts, String price) {
        PriceCache pc = new PriceCache();
        pc.setAsset(a);
        pc.setTimestamp(LocalDateTime.parse(ts));
        pc.setPrice(new BigDecimal(price));
        pc.setSource("TEST");
        priceCacheRepository.save(pc);
    }
}
