package at.stefan.moodinvestor.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Enables Spring's annotation-driven caching support.
 * Allows services annotated with @Cacheable and @CacheEvict
 * to store and retrieve results using Spring Boot's default
 * in-memory cache manager.
 */
@Configuration
@EnableCaching
public class CacheConfig {
    // No explicit bean definitions required; enabling caching is sufficient.
}