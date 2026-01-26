package at.stefan.moodinvestor.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import at.stefan.moodinvestor.model.EmotionLog;

public interface EmotionLogRepository extends JpaRepository<EmotionLog, Long> {

    List<EmotionLog> findByClerkUserIdOrderByDayDesc(String clerkUserId);

    Optional<EmotionLog> findByClerkUserIdAndDay(String clerkUserId, LocalDate day);

    Optional<EmotionLog> findByEmotionLogIdAndClerkUserId(Long emotionLogId, String clerkUserId);
}
