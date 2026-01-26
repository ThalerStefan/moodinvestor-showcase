package at.stefan.moodinvestor.dto;

import java.util.List;

public class EmotionSummaryDto {

    private final List<String> labels;
    private final List<Integer> moods;
    private final Integer todayMood;
    private final String todayMoodDescription;
    private final Double averageLast7;
    private final Integer countCurrentMonth;
    private final Double averageMonthMood;
    private final Integer mostFrequentMood;
    private final String mostFrequentMoodDescription;
    private final Double percentageBelowNeutral;
    private final String mostFrequentDay;

    public EmotionSummaryDto(List<String> labels, List<Integer> moods, Integer todayMood, String todayMoodDescription,
            Double averageLast7, Integer countCurrentMonth, Double averageMonthMood, Integer mostFrequentMood,
            String mostFrequentMoodDescription, Double percentageBelowNeutral, String mostFrequentDay) {
        this.labels = labels;
        this.moods = moods;
        this.todayMood = todayMood;
        this.todayMoodDescription = todayMoodDescription;
        this.averageLast7 = averageLast7;
        this.countCurrentMonth = countCurrentMonth;
        this.averageMonthMood = averageMonthMood;
        this.mostFrequentMood = mostFrequentMood;
        this.mostFrequentMoodDescription = mostFrequentMoodDescription;
        this.percentageBelowNeutral = percentageBelowNeutral;
        this.mostFrequentDay = mostFrequentDay;
    }

    public List<String> getLabels() {
        return labels;
    }

    public List<Integer> getMoods() {
        return moods;
    }

    public Integer getTodayMood() {
        return todayMood;
    }

    public String getTodayMoodDescription() {
        return todayMoodDescription;
    }

    public Double getAverageLast7() {
        return averageLast7;
    }

    public Integer getCountCurrentMonth() {
        return countCurrentMonth;
    }

    public Double getAverageMonthMood() {
        return averageMonthMood;
    }

    public Integer getMostFrequentMood() {
        return mostFrequentMood;
    }

    public String getMostFrequentMoodDescription() {
        return mostFrequentMoodDescription;
    }

    public Double getPercentageBelowNeutral() {
        return percentageBelowNeutral;
    }

    public String getMostFrequentDay() {
        return mostFrequentDay;
    }

        
}
