package at.stefan.moodinvestor.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.price")
public class PriceServiceProperties {

    private long refreshIntervalMs = 30000L;

    private String binanceBaseUrl = "https://api.binance.com";
    private String coingeckoBaseUrl = "https://api.coingecko.com/api/v3";

    public long getRefreshIntervalMs() {
        return refreshIntervalMs;
    }

    public void setRefreshIntervalMs(long refreshIntervalMs) {
        this.refreshIntervalMs = refreshIntervalMs;
    }

    public String getBinanceBaseUrl() {
        return binanceBaseUrl;
    }

    public void setBinanceBaseUrl(String baseUrl) {
        this.binanceBaseUrl = baseUrl;
    }

    public String getCoingeckoBaseUrl() {
        return coingeckoBaseUrl;
    }

    public void setCoingeckoBaseUrl(String coingeckoBaseUrl) {
        this.coingeckoBaseUrl = coingeckoBaseUrl;
    }

}
