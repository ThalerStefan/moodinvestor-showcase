package at.stefan.moodinvestor.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import at.stefan.moodinvestor.dto.PortfolioPerformanceDto;
import at.stefan.moodinvestor.service.PortfolioPerformanceService;

/**
 * Controller exposing the portfolio performance time series endpoint.
 * Supported ranges: 1D, 1W, 1M, 1Y, ALL
 */
@RestController
@RequestMapping("/api/portfolio/performance")
public class PortfolioPerformanceController {

    private final PortfolioPerformanceService service;

    public PortfolioPerformanceController(PortfolioPerformanceService service) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @GetMapping
    public PortfolioPerformanceDto getPerformance(@AuthenticationPrincipal Jwt jwt, @RequestParam(name = "range", required = false) String range) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}
