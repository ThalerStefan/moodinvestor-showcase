package at.stefan.moodinvestor.model;

import jakarta.persistence.*;

/**
 * Corresponds to table 'pfglog'.
 * Stores the 5 answers (1–5) at the time of a transaction as well as the
 * calculated score (0–100).
 */
@Entity
@Table(name = "pfglog", uniqueConstraints = @UniqueConstraint(name = "uk_pfglog_txn", columnNames = "txnId"), indexes = {
        @Index(name = "idx_pfglog_txn", columnList = "txnId") })
public class PfgLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pfgLogId")
    private Long pfgLogId;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "txnId", foreignKey = @ForeignKey(name = "fk_pfglog_txn"))
    private Txn txn;

    // Five raw answers 1..5
    @Column(name = "q1", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Byte q1;

    @Column(name = "q2", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Byte q2;

    @Column(name = "q3", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Byte q3;

    @Column(name = "q4", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Byte q4;

    @Column(name = "q5", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Byte q5;

    /**
     * Berechneter PFG-Score 0..100.
     * Formel: (Q1+Q2+Q3+Q4+Q5) * 20 / 5
     */
    @Column(name = "pfgValue", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Byte pfgValue;

    public Long getPfgLogId() {
        return pfgLogId;
    }

    public void setPfgLogId(Long pfgLogId) {
        this.pfgLogId = pfgLogId;
    }

    public Txn getTxn() {
        return txn;
    }

    public void setTxn(Txn txn) {
        this.txn = txn;
    }

    public Byte getQ1() {
        return q1;
    }

    public void setQ1(Byte q1) {
        this.q1 = q1;
    }

    public Byte getQ2() {
        return q2;
    }

    public void setQ2(Byte q2) {
        this.q2 = q2;
    }

    public Byte getQ3() {
        return q3;
    }

    public void setQ3(Byte q3) {
        this.q3 = q3;
    }

    public Byte getQ4() {
        return q4;
    }

    public void setQ4(Byte q4) {
        this.q4 = q4;
    }

    public Byte getQ5() {
        return q5;
    }

    public void setQ5(Byte q5) {
        this.q5 = q5;
    }

    public Byte getPfgValue() {
        return pfgValue;
    }

    public void setPfgValue(Byte pfgValue) {
        this.pfgValue = pfgValue;
    }

}
