package at.stefan.moodinvestor.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public String health() {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

}