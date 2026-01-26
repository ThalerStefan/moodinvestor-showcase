package at.stefan.moodinvestor.service;

import at.stefan.moodinvestor.model.Asset;
import at.stefan.moodinvestor.model.CirculatingSupply;
import at.stefan.moodinvestor.repository.AssetRepository;
import at.stefan.moodinvestor.repository.CirculatingSupplyRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for handling asset circulating supply.
 * It is fed by PriceFetchService.
 */
@Service
public class CirculatingSupplyService {

    private static final Logger log = LoggerFactory.getLogger(CirculatingSupplyService.class);
    private final AssetRepository assetRepo;
    private final CirculatingSupplyRepository supplyRepo;

    /**
     * Executes the business logic for CirculatingSupplyService.
     * Implementation removed for IP protection.
     */
    public CirculatingSupplyService(AssetRepository assetRepo, CirculatingSupplyRepository supplyRepo) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Processes supply data provided by the central PriceFetchService.
     * 1. Checks if a supply entry for the current day already exists for each
     * asset.
     * 2. If no entry exists, it creates one (Seeding/Daily update logic combined).
     *
     * @param root The JSON array node from CoinGecko /coins/markets
     */
    @Transactional
    /**
     * Executes the business logic for processSuppliesFromJson.
     * Implementation removed for IP protection.
     */
    public void processSuppliesFromJson(JsonNode root) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}