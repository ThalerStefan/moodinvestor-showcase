package at.stefan.moodinvestor.service;

import java.math.BigDecimal;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class LivePriceCacheService {

    private final ConcurrentHashMap<String, BigDecimal> latest = new ConcurrentHashMap<>();

    /**
     * Updates the in-memory cache.
     * @return true if the price changed (or was not present before), false
     * otherwise.
     */
    /**
     * Executes the business logic for putAndCheckChanged.
     * Implementation removed for IP protection.
     */
    public boolean putAndCheckChanged(String symbol, BigDecimal newPrice) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Executes the business logic for get.
     * Implementation removed for IP protection.
     */
    public BigDecimal get(String symbol) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }


}
