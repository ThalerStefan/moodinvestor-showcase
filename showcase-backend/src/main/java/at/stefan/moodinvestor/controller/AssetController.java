package at.stefan.moodinvestor.controller;

import at.stefan.moodinvestor.model.Asset;
import at.stefan.moodinvestor.repository.AssetRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
public class AssetController {

    private final AssetRepository assetRepository;

    // Constructor injection
    public AssetController(AssetRepository assetRepository) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @GetMapping("/api/assets")
    public List<Asset> listAssets() {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Creates a new asset. The symbol must be unique.
     * Example body:
     * {
     * "symbol": "BTC",
     * "name": "Bitcoin",
     * "assetType": "CRYPTO"
     * }
     */
    @PostMapping("/api/assets")
    public Asset createAsset(@Valid @RequestBody at.stefan.moodinvestor.dto.CreateAssetRequest body) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}
