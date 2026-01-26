package at.stefan.moodinvestor.dto;

import java.time.LocalDate;

/**
 * Return/input model for EmotionLog entries.
 * mood: 1–5 (Byte)
 * note: optional
 */
public class EmotionDto {
    private Long id;
    private LocalDate day;
    private Byte mood;
    private String note;

    public EmotionDto() {
    }

    public EmotionDto(Long id, LocalDate day, Byte mood, String note) {
        this.id = id;
        this.day = day;
        this.mood = mood;
        this.note = note;
    }

    public EmotionDto(LocalDate day, Byte mood, String note) {
        this(null, day, mood, note);
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

}
