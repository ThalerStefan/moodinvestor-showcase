package at.stefan.moodinvestor.controller;

import at.stefan.moodinvestor.model.Asset;
import at.stefan.moodinvestor.repository.AssetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AssetControllerTest {

    @Autowired MockMvc mvc;
    @Autowired AssetRepository repo;

    @BeforeEach
    void seed() {
        if (repo.findBySymbol("BTC").isEmpty()) {
            Asset a = new Asset();
            a.setSymbol("BTC");
            a.setName("Bitcoin");
            a.setAssetType(Asset.AssetType.CRYPTO);
            repo.save(a);
        }
    }

    @Test
    void listAssets_ok() throws Exception {
        mvc.perform(get("/api/assets"))
           .andExpect(status().isOk());
    }
}
