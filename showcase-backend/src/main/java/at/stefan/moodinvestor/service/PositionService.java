package at.stefan.moodinvestor.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import at.stefan.moodinvestor.dto.PositionDto;
import at.stefan.moodinvestor.model.PositionView;
import at.stefan.moodinvestor.repository.PositionViewRepository;

@Service
public class PositionService {

    private final PositionViewRepository repo;

    /**
     * Executes the business logic for PositionService.
     * Implementation removed for IP protection.
     */
    public PositionService(PositionViewRepository repo) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Executes the business logic for listAll.
     * Implementation removed for IP protection.
     */
    public List<PositionDto> listAll(String clerkUserId) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Executes the business logic for getOne.
     * Implementation removed for IP protection.
     */
    public PositionDto getOne(String clerkUserId, String symbol) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
    
}
