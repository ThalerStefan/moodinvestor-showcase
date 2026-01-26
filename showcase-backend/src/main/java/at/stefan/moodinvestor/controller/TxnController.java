package at.stefan.moodinvestor.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import at.stefan.moodinvestor.dto.CreateTxnWithPfgRequest;
import at.stefan.moodinvestor.dto.TxnDto;
import at.stefan.moodinvestor.dto.UpdateTxnWithPfgRequest;
import at.stefan.moodinvestor.model.PfgLog;
import at.stefan.moodinvestor.model.Txn;
import at.stefan.moodinvestor.repository.PfgLogRepository;
import at.stefan.moodinvestor.service.TxnService;

import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.List;

/**
 * REST endpoints for transactions.
 */
@RestController
@RequestMapping("/api/txns")
public class TxnController {

    private final TxnService txnService;
    private final PfgLogRepository pfgRepo;

    public TxnController(TxnService txnService, PfgLogRepository pfgRepo) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Returns a list of transactions of the current user.
     * Can optionally be filtered by assetId.
     * Example: GET /api/txns?assetId=1
     */
    @GetMapping
    public List<TxnDto> list(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) Long assetId) {
                throw new UnsupportedOperationException("Implementation hidden for IP protection.");
            }

    /**
     * Creates a transaction including PFG questions for the current user.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TxnDto create(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateTxnWithPfgRequest req) {
                throw new UnsupportedOperationException("Implementation hidden for IP protection.");
            }

    /**
     * Deletes the transaction by its ID (current user only).
     */
    @DeleteMapping("/{txnId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt,
            @PathVariable Long txnId) {
                throw new UnsupportedOperationException("Implementation hidden for IP protection.");
            }

    /**
     * Updates an existing transaction for the current user.
     */
    @PutMapping("/{txnId}")
    public TxnDto update(@AuthenticationPrincipal Jwt jwt,
            @PathVariable Long txnId,
            @Valid @RequestBody UpdateTxnWithPfgRequest req) {
                throw new UnsupportedOperationException("Implementation hidden for IP protection.");
            }
}
