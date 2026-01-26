package at.stefan.moodinvestor.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Summary of the entire portfolio.
 *
 * positions – List of individual asset summaries
 * totalValue – Sum of the market values of all positions
 * averagePfg – average Personal Fear & Greed value (can be null)
 */
public class PortfolioSummaryDto {
    private List<AssetSummaryDto> positions;
    private BigDecimal totalValue;
    private Integer averagePfg;

    public PortfolioSummaryDto(List<AssetSummaryDto> positions,
            BigDecimal totalValue,
            Integer averagePfg) {
        this.positions = positions;
        this.totalValue = totalValue;
        this.averagePfg = averagePfg;
    }

    public List<AssetSummaryDto> getPositions() {
        return positions;
    }

    public BigDecimal getTotalValue() {
        return totalValue;
    }

    public Integer getAveragePfg() {
        return averagePfg;
    }
}
