package at.stefan.moodinvestor.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import at.stefan.moodinvestor.dto.AssetMarketcapDto;
import at.stefan.moodinvestor.dto.TopPositionDto;
import at.stefan.moodinvestor.service.DashboardService;


/**
 * REST controller exposing endpoints for dashboard
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @GetMapping("/top5")
    public List<TopPositionDto> getTop5(@AuthenticationPrincipal Jwt jwt) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @GetMapping("/assets-table")
    public List<AssetMarketcapDto> getAssetTable() {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}
