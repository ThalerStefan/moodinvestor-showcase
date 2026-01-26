package at.stefan.moodinvestor.controller;

import at.stefan.moodinvestor.dto.PositionDto;
import at.stefan.moodinvestor.service.PositionService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Provides position data from the view 'vposition'.
 *
 * GET /api/positions
 * -> List of all positions
 *
 * GET /api/positions/{symbol}
 * -> a single position (404, if not found)
 */

@RestController
@RequestMapping("/api/positions")
public class PositionController {

    private final PositionService service;

    public PositionController(PositionService service) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @GetMapping
    public List<PositionDto> listAll(@AuthenticationPrincipal Jwt jwt) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @GetMapping("/{symbol}")
    public PositionDto getOne(@AuthenticationPrincipal Jwt jwt, @PathVariable String symbol) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}
