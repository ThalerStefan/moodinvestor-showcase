package at.stefan.moodinvestor.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import at.stefan.moodinvestor.dto.EmotionSummaryDto;
import at.stefan.moodinvestor.service.EmotionSummaryService;

/**
 * Controller exposing an endpoint that returns a fully prepared summary of
 * emotion logs (user-scoped).
 */
@RestController
@RequestMapping("/api/emotions")
public class EmotionSummaryController {

    private final EmotionSummaryService service;

    public EmotionSummaryController(EmotionSummaryService service) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @GetMapping("/summary")
    public EmotionSummaryDto getSummary(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(name = "days", required = false) Integer days) {
                throw new UnsupportedOperationException("Implementation hidden for IP protection.");
            }
}
