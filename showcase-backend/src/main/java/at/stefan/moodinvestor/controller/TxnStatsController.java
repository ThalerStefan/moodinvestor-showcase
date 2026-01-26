package at.stefan.moodinvestor.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import at.stefan.moodinvestor.dto.TxnStatsDto;
import at.stefan.moodinvestor.service.TxnStatsService;

/**
 * Controller exposing an endpoint for the transaction statistics (user-scoped).
 */
@RestController
@RequestMapping("/api/txns")
public class TxnStatsController {

    private final TxnStatsService service;

    public TxnStatsController(TxnStatsService service) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @GetMapping("/stats")
    public List<TxnStatsDto> getStats(@AuthenticationPrincipal Jwt jwt) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}
