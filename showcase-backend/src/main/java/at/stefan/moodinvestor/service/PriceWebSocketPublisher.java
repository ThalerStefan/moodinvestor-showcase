package at.stefan.moodinvestor.service;

import java.time.Instant;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import at.stefan.moodinvestor.dto.AssetMarketcapDto;
import at.stefan.moodinvestor.dto.AssetRowUpdateDto;

@Service
public class PriceWebSocketPublisher {

    private final SimpMessagingTemplate messaging;
    private final DashboardService dashboardService;

    /**
     * Executes the business logic for PriceWebSocketPublisher.
     * Implementation removed for IP protection.
     */
    public PriceWebSocketPublisher(SimpMessagingTemplate messaging, DashboardService dashboardService) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * Broadcasts a dashboard-row update to all connected clients
     */
    /**
     * Executes the business logic for broadcastAssetRow.
     * Implementation removed for IP protection.
     */
    public void broadcastAssetRow(String symbol, String source) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

}
