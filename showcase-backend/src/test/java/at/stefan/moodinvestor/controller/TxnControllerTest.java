package at.stefan.moodinvestor.controller;

import at.stefan.moodinvestor.model.Asset;
import at.stefan.moodinvestor.model.PriceCache;
import at.stefan.moodinvestor.repository.AssetRepository;
import at.stefan.moodinvestor.repository.PriceCacheRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TxnControllerTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    AssetRepository assetRepository;
    @Autowired
    PriceCacheRepository priceCacheRepository;

    @BeforeEach
    void seed() {
        // Clean up so no duplicate is created
        priceCacheRepository.deleteAll();

        Asset btc = assetRepository.findBySymbol("BTC").orElseGet(() -> {
            Asset a = new Asset();
            a.setSymbol("BTC");
            a.setName("Bitcoin");
            a.setAssetType(Asset.AssetType.CRYPTO);
            return assetRepository.save(a);
        });

        PriceCache pc = new PriceCache();
        pc.setAsset(btc);
        // leicht variierender Zeitstempel, verhindert Dupes zwischen Tests
        pc.setTimestamp(LocalDateTime.now().withNano(0));
        pc.setPrice(new BigDecimal("65000"));
        pc.setSource("TEST");
        priceCacheRepository.save(pc);
    }

    @Test
    void createTxn_withPfg_ok() throws Exception {
        String body = """
                {"symbol":"BTC","timestamp":"2025-10-15T10:05:00",
                 "side":"BUY","quantity":0.01,"price":65000,
                 "note":"ok","pfg":[3,4,4,2,5]}
                """;

        mvc.perform(post("/api/txns")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void createTxn_bad_side_400() throws Exception {
        String body = """
                {"symbol":"BTC","timestamp":"2025-10-15T10:05:00",
                 "side":"BOOM","quantity":1,"price":1,"pfg":[3,3,3,3,3]}
                """;
        mvc.perform(post("/api/txns").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createTxn_invalid_pfg_length_400() throws Exception {
        String body = """
                {"symbol":"BTC","timestamp":"2025-10-15T10:05:00",
                 "side":"BUY","quantity":1,"price":1,"pfg":[3,3,3,3]}
                """;
        mvc.perform(post("/api/txns").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }
}
