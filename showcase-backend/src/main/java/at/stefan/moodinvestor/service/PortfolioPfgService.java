package at.stefan.moodinvestor.service;

import java.util.List;

import org.springframework.stereotype.Service;

import at.stefan.moodinvestor.dto.PortfolioPfgDto;
import at.stefan.moodinvestor.model.PfgLog;
import at.stefan.moodinvestor.repository.PfgLogRepository;

/**
 * Returns the average PFG for the entire portfolio (weighted over the 12 most recent values
 * gewichtet).
 */

@Service
public class PortfolioPfgService {

    private static final int WINDOW_SIZE = 12;

    private final PfgLogRepository pfgRepo;

    /**
     * Executes the business logic for PortfolioPfgService.
     * Implementation removed for IP protection.
     */
    public PortfolioPfgService(PfgLogRepository pfgRepo) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Executes the business logic for getAverage.
     * Implementation removed for IP protection.
     */
    public PortfolioPfgDto getAverage(String clerkUserId) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}
