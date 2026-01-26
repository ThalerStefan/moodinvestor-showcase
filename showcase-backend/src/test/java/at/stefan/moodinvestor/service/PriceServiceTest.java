package at.stefan.moodinvestor.service;

import at.stefan.moodinvestor.dto.PriceDto;
import at.stefan.moodinvestor.model.Asset;
import at.stefan.moodinvestor.model.PriceCache;
import at.stefan.moodinvestor.repository.AssetRepository;
import at.stefan.moodinvestor.repository.PriceCacheRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PriceServiceTest {

    @Mock
    AssetRepository assetRepo;

    @Mock
    PriceCacheRepository priceRepo;

    @Mock
    PriceFetchService priceFetchService; 

    @InjectMocks
    PriceService service;

    @BeforeEach
    void setUp() {
        service = new PriceService(assetRepo, priceRepo, priceFetchService);
    }

    @Test
    void upsertMockPrice_ok() {
        Asset btc = new Asset();
        btc.setSymbol("BTC");
        when(assetRepo.findBySymbol("BTC")).thenReturn(Optional.of(btc));
        when(priceRepo.save(any(PriceCache.class))).thenAnswer(inv -> inv.getArgument(0));

        PriceDto dto = service.upsertMockPrice("BTC", "2025-10-15T10:00:00",
                new BigDecimal("65000"), "TEST");

        assertNotNull(dto);
        assertEquals("BTC", dto.getSymbol());
        assertEquals(new BigDecimal("65000"), dto.getPrice());
        assertEquals("TEST", dto.getSource());
        verify(priceRepo).save(any(PriceCache.class));
    }

    @Test
    void upsertMockPrice_404_when_asset_missing() {
        when(assetRepo.findBySymbol("XYZ")).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> service.upsertMockPrice("XYZ", "2025-10-15T10:00:00",
                new BigDecimal("1"), "TEST"));
    }

    @Test
    void getLatest_uses_repo() {
        Asset btc = new Asset();
        btc.setSymbol("BTC");
        when(assetRepo.findBySymbol("BTC")).thenReturn(Optional.of(btc));
        when(priceRepo.findTopByAsset_SymbolOrderByTimestampDesc("BTC"))
                .thenReturn(Optional.of(new PriceCache()));

        var out = service.getLatest("BTC");
        assertNotNull(out);
    }

    @Test
    void getHistory_bad_from_throws_400() {
        assertThrows(ResponseStatusException.class, () -> service.getHistory("BTC", "NOT_A_DATE", null));
    }
}
