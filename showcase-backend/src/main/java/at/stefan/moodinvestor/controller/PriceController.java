package at.stefan.moodinvestor.controller;

import at.stefan.moodinvestor.dto.PriceDto;
import at.stefan.moodinvestor.service.PriceService;
import jakarta.validation.constraints.Min;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * Controller for price endpoints.
 */
@RestController
@RequestMapping("/api/prices")
public class PriceController {

    private final PriceService service;

    public PriceController(PriceService service) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Returns the latest price for an asset ID (GET
     * /api/prices/{assetId}/latest).
     */
    @GetMapping("/{assetId}/latest")
    public PriceDto latestById(@PathVariable Long assetId) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * (Optional) History for a symbol – not part of the minimum requirements,
     * but remains internally available.
     */
    @GetMapping("/{symbol}/history")
    public List<PriceDto> history(
            @PathVariable String symbol,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) @Min(1) Integer limit) {
                throw new UnsupportedOperationException("Implementation hidden for IP protection.");
            }

    @PostMapping("/mock")
    public PriceDto mockInsert(@RequestBody MockPriceRequest body) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Updates all prices (POST /api/prices/refresh).
     */
    @PostMapping("/refresh")
    public List<PriceDto> refreshAll() {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    public static class MockPriceRequest {
        public String symbol;
        public String timestamp;
        public BigDecimal price;
        public String source;
    }
}
