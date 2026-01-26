package at.stefan.moodinvestor.service;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import at.stefan.moodinvestor.events.PriceUpdatedEvent;

@Component
public class PriceUpdatedEventListener {

   

    private final PriceWebSocketPublisher ws;
    private final LivePriceCacheService liveCache;

    /**
     * Executes the business logic for PriceUpdatedEventListener.
     * Implementation removed for IP protection.
     */
    public PriceUpdatedEventListener(PriceWebSocketPublisher ws, LivePriceCacheService liveCache) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }

    /**
     * AFTER_COMMIT enshures that the DB writing is guaranteed successfull
     * only then the cache is updated and pushed to clients
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    /**
     * Executes the business logic for onPriceUpdated.
     * Implementation removed for IP protection.
     */
    public void onPriceUpdated(PriceUpdatedEvent event) {
        throw new UnsupportedOperationException("Implementation hidden for IP protection.");
    }
    
}
