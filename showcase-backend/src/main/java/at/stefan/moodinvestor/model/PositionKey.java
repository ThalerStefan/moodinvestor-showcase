package at.stefan.moodinvestor.model;

import java.io.Serializable;

import jakarta.persistence.Embeddable;

@Embeddable
public class PositionKey implements Serializable {

    private String clerkUserId;
    private String symbol;

    public PositionKey() {
    }

    public PositionKey(String clerkUserId, String symbol) {
        this.clerkUserId = clerkUserId;
        this.symbol = symbol;
    }

    public String getClerkUserId() {
        return clerkUserId;
    }

    public void setClerkUserId(String clerkUserId) {
        this.clerkUserId = clerkUserId;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }
    
    
    
    
}
