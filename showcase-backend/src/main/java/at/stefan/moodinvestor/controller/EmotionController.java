package at.stefan.moodinvestor.controller;

import at.stefan.moodinvestor.dto.EmotionDto;
import at.stefan.moodinvestor.service.EmotionService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/emotions")
public class EmotionController {

    private final EmotionService service;

    public EmotionController(EmotionService service) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @GetMapping
    public List<EmotionDto> all(@AuthenticationPrincipal Jwt jwt) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    @GetMapping("/{day}")
    public EmotionDto byDay(@AuthenticationPrincipal Jwt jwt, @PathVariable String day) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    // Create or overwrite by day (upsert behavior)
    @PostMapping
    public EmotionDto save(@AuthenticationPrincipal Jwt jwt, @RequestBody EmotionDto body) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    // Update by ID (ownership enforced)
    @PutMapping("/{id}")
    public EmotionDto update(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @RequestBody EmotionDto body) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    // Delete by ID (ownership enforced)
    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
}
