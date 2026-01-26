package at.stefan.moodinvestor.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import at.stefan.moodinvestor.service.UrlCacheService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/url")
public class UrlController {

    private final UrlCacheService service;

    public UrlController(UrlCacheService service) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    // CMC-URL endpoint
    @GetMapping("/{symbol}/url")
    public ResponseEntity<String> getCmcUrl(@PathVariable String symbol) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    // Image-URL endpoint
    @GetMapping("/{symbol}/image")
    public ResponseEntity<String> getImageUrl(@PathVariable String symbol) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

}