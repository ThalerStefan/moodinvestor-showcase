package at.stefan.moodinvestor.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

// Configuration class to enable scheduling support in Spring.

@Configuration
@EnableScheduling
public class SchedulingConfig {
    // No additional beans required – @EnableScheduling is sufficient
}
