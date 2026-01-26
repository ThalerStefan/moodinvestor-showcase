package at.stefan.moodinvestor.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import at.stefan.moodinvestor.dto.PortfolioSummaryDto;
import at.stefan.moodinvestor.service.PortfolioSummaryService;

/**
 * Endpoint for portfolio summary.
 * GET /api/portfolio/summary
 */
@RestController
@RequestMapping("/api/portfolio")
public class PortfolioSummaryController {

    private final PortfolioSummaryService service;

    public PortfolioSummaryController(PortfolioSummaryService service) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @GetMapping("/summary")
    public PortfolioSummaryDto summary(@AuthenticationPrincipal Jwt jwt) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}
