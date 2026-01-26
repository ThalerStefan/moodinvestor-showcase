package at.stefan.moodinvestor.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import at.stefan.moodinvestor.dto.PortfolioPfgDto;
import at.stefan.moodinvestor.service.PortfolioPfgService;

/**
 * Provides the average PFG across all transactions (for the dashboard).
 */
@RestController
public class PfgController {

    private final PortfolioPfgService service;

    public PfgController(PortfolioPfgService service) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @GetMapping("/api/pfg")
    public PortfolioPfgDto getPortfolioPfg(@AuthenticationPrincipal Jwt jwt) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}
