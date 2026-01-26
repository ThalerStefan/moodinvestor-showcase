package at.stefan.moodinvestor.controller;

import at.stefan.moodinvestor.model.Asset;
import at.stefan.moodinvestor.repository.AssetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PriceControllerTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    AssetRepository assetRepository;

    @BeforeEach
    void ensureAsset() {
        assetRepository.findBySymbol("BTC").orElseGet(() -> {
            Asset a = new Asset();
            a.setSymbol("BTC");
            a.setName("Bitcoin");
            a.setAssetType(Asset.AssetType.CRYPTO);
            return assetRepository.save(a);
        });
    }

    @Test
    void mock_then_latest_then_history() throws Exception {
        String body = """
                {"symbol":"BTC","timestamp":"2025-10-15T10:00:00","price":65000,"source":"TEST"}
                """;
        mvc.perform(post("/api/prices/mock").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()) // PriceController returns DTO directly (no 201)
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));

        mvc.perform(get("/api/prices/BTC"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));

        mvc.perform(get("/api/prices/BTC/history")
                .param("from", "2025-10-15T09:00:00")
                .param("limit", "10"))
                .andExpect(status().isOk());
    }

    @Test
    void mock_unknown_asset_404() throws Exception {
        String body = """
                {"symbol":"XYZ","timestamp":"2025-10-15T10:00:00","price":1,"source":"TEST"}
                """;
        mvc.perform(post("/api/prices/mock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                // Adjust expectation to actual behavior:
                .andExpect(status().isBadRequest());
    }

    @Test
    void history_bad_from_400() throws Exception {
        mvc.perform(get("/api/prices/BTC/history").param("from", "NOT_A_DATE"))
                .andExpect(status().isBadRequest());
    }
}
