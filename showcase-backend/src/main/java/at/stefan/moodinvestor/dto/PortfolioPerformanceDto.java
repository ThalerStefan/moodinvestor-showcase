package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;
import java.util.List;

public class PortfolioPerformanceDto {

    private final List<String> timestamps;
    private final List<BigDecimal> values;
    private final BigDecimal total;
    
    public PortfolioPerformanceDto(List<String> timestamps, List<BigDecimal> values, BigDecimal total) {
        this.timestamps = timestamps;
        this.values = values;
        this.total = total;
    }

    public List<String> getTimestamps() {
        return timestamps;
    }

    public List<BigDecimal> getValues() {
        return values;
    }

    public BigDecimal getTotal() {
        return total;
    }

}
