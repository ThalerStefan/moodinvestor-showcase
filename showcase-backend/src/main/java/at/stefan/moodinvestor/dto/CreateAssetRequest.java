package at.stefan.moodinvestor.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for creating a new asset.
 * All fields are mandatory.
 */
public class CreateAssetRequest {

    @NotBlank
    private String symbol;

    @NotBlank
    private String name;

    @NotBlank
    private String assetType;

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAssetType() {
        return assetType;
    }

    public void setAssetType(String assetType) {
        this.assetType = assetType;
    }
}
