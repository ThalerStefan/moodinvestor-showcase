package at.stefan.moodinvestor.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

import org.springframework.stereotype.Service;

import at.stefan.moodinvestor.dto.TxnStatsDto;
import at.stefan.moodinvestor.model.Txn;
import at.stefan.moodinvestor.model.PfgLog;
import at.stefan.moodinvestor.repository.TxnRepository;
import at.stefan.moodinvestor.repository.PfgLogRepository;
import at.stefan.moodinvestor.repository.PriceCacheRepository;

/**
 * Service responsible for computing the statistics displayed
 * on the transaction page (user-scoped).
 */
@Service
public class TxnStatsService {

    private final TxnRepository txnRepo;
    private final PfgLogRepository pfgLogRepo;
    private final PriceCacheRepository priceRepo;

    /**
     * Executes the business logic for TxnStatsService.
     * Implementation removed for IP protection.
     */
    public TxnStatsService(TxnRepository txnRepo, PfgLogRepository pfgLogRepo, PriceCacheRepository priceRepo) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Calculates statistics per asset across all transactions of the user.
     */
    /**
     * Executes the business logic for getStats.
     * Implementation removed for IP protection.
     */
    public List<TxnStatsDto> getStats(String clerkUserId) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}
