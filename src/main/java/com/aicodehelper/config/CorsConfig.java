package com.aicodehelper.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * This configuration enables cross-origin requests from frontend applications,
 * allowing the web interface to communicate with the backend API.
 * Includes security-conscious defaults while maintaining development flexibility.
 */
@Configuration
@Slf4j
public class CorsConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://localhost:8080}")
    private String[] allowedOrigins;

    @Value("${cors.max-age:3600}")
    private long maxAge;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        log.info("Configuring CORS with allowed origins: {}", (Object) allowedOrigins);
        
        registry.addMapping("/**")
                // Allow credentials for session management
                .allowCredentials(true)
                // Configure allowed origins (development and production)
                .allowedOriginPatterns(allowedOrigins)
                // Allow common HTTP methods
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                // Allow all headers for flexibility
                .allowedHeaders("*")
                // Expose necessary headers for frontend
                .exposedHeaders("Content-Type", "X-Requested-With", "Accept", "Authorization", "Cache-Control")
                // Cache preflight requests
                .maxAge(maxAge);
                
        log.info("CORS configuration applied successfully");
    }
}