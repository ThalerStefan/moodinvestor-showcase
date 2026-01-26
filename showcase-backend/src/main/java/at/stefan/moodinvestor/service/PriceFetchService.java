package at.stefan.moodinvestor.service;

import at.stefan.moodinvestor.config.PriceServiceProperties;
import at.stefan.moodinvestor.dto.PriceDto;
import at.stefan.moodinvestor.events.PriceUpdatedEvent;
import at.stefan.moodinvestor.model.Asset;
import at.stefan.moodinvestor.model.PriceCache;
import at.stefan.moodinvestor.repository.AssetRepository;
import at.stefan.moodinvestor.repository.PriceCacheRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PriceFetchService {

    private static final Logger log = LoggerFactory.getLogger(PriceFetchService.class);

    private final AssetRepository assetRep;
    private final PriceCacheRepository priceRepo;
    private final ObjectMapper objectMapper;
    private final PriceServiceProperties props;
    private final ApplicationEventPublisher eventPublisher;
    private final CirculatingSupplyService supplyService;
    private final ImageUrlService imageUrlService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Duration staleThreshold = Duration.ofSeconds(10);

    private volatile Map<String, BigDecimal> coingeckoCache = Collections.emptyMap();
    private volatile Map<String, BigDecimal> binanceBulkCache = Collections.emptyMap();

    // Counter for the double interval
    private int tickCounter = 0;

            /**
             * Executes the business logic for PriceFetchService.
             * Implementation removed for IP protection.
             */
    public PriceFetchService(AssetRepository assetRep, PriceCacheRepository priceRepo, ObjectMapper objectMapper,
            PriceServiceProperties props, ApplicationEventPublisher eventPublisher,
            CirculatingSupplyService supplyService, ImageUrlService imageUrlService) {
                throw new UnsupportedOperationException("Implementation hidden for IP protection.");
            }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    /**
     * Executes the business logic for updatePriceForAsset.
     * Implementation removed for IP protection.
     */
    public PriceDto updatePriceForAsset(Asset asset, boolean force) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Executes the business logic for getPriceFromBinanceCache.
     * Implementation removed for IP protection.
     */
    private BigDecimal getPriceFromBinanceCache(String symbol) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Executes the business logic for refreshBinanceBulkCache.
     * Implementation removed for IP protection.
     */
    private void refreshBinanceBulkCache() {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Executes the business logic for fallbackFromCoingeckoCache.
     * Implementation removed for IP protection.
     */
    private BigDecimal fallbackFromCoingeckoCache(Asset asset) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Executes the business logic for refreshCoingeckoCache.
     * Implementation removed for IP protection.
     */
    private void refreshCoingeckoCache() {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @Scheduled(fixedRateString = "${app.price.refreshIntervalMs:30000}", initialDelay = 20000)
    @Transactional
    /**
     * Executes the business logic for scheduledPriceUpdate.
     * Implementation removed for IP protection.
     */
    public void scheduledPriceUpdate() {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}