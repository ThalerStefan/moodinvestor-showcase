package at.stefan.moodinvestor.dto;

/**
 * DTO for portfolio PFG summary.
 */

public class PortfolioPfgDto {

    private int averagePfg; // 0..100 rounded
    private long sampleSize; // Number of PFG-Logs

    public int getAveragePfg() {
        return averagePfg;
    }

    public void setAveragePfg(int averagePfg) {
        this.averagePfg = averagePfg;
    }

    public long getSampleSize() {
        return sampleSize;
    }

    public void setSampleSize(long sampleSize) {
        this.sampleSize = sampleSize;
    }

}
