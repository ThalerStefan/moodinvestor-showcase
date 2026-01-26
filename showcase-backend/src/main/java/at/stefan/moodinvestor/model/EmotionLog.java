package at.stefan.moodinvestor.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Corresponds to table 'emotionlog'
 * Columns: emotionLogId, day, mood, note
 */
@Entity
@Table(name = "emotionlog", uniqueConstraints = @UniqueConstraint(name = "uk_emotion_user_day", columnNames = {
        "clerkUserId", "day" }))
public class EmotionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "emotionLogId")
    private Long emotionLogId;

    @Column(name = "day", nullable = false)
    private LocalDate day;

    @Column(name = "mood", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Byte mood;

    @Column(name = "note", length = 2500)
    private String note;

    @Column(name = "clerkUserId", nullable = false, length = 64)
    private String clerkUserId;

    // Getters/Setters
    public Long getEmotionLogId() {
        return emotionLogId;
    }

    public LocalDate getDay() {
        return day;
    }

    public void setDay(LocalDate day) {
        this.day = day;
    }

    public Byte getMood() {
        return mood;
    }

    public void setMood(Byte mood) {
        this.mood = mood;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getClerkUserId() {
        return clerkUserId;
    }

    public void setClerkUserId(String clerkUserId) {
        this.clerkUserId = clerkUserId;
    }

}
