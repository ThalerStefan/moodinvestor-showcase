package at.stefan.moodinvestor.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // for a stateless REST API with JWT, CSRF can be disabled
                .csrf(csrf -> csrf.disable())

                // enable CORS so browser requests from SPA can include Athorization header
                .cors(Customizer.withDefaults())

                // no server session needed (JWT is stateless)
                .sessionManagement(sm -> sm.sessionCreationPolicy(
                        org.springframework.security.config.http.SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // public enpoints
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers("/actuator/health").permitAll()

                        // preflight requests must be allowed (important for CORS)
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                        // protect all API endpoints
                        .requestMatchers("/api/**").authenticated()

                        // everything else (static, frontend, etc.)
                        .anyRequest().permitAll())

                // validate JWT from Authorization: Bearer <toker>
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

        return http.build();
    }
}
