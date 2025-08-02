package com.aicodehelper;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

/**
 * AI Code Helper Application - Main Entry Point
 * 
 * This Spring Boot application provides an AI-powered programming assistant
 * with the following key features:
 * 
 * - LangChain4j integration for advanced AI capabilities
 * - RAG (Retrieval Augmented Generation) with knowledge base
 * - Real-time streaming responses via Server-Sent Events
 * - Interview question search and career guidance
 * - Input safety guardrails and comprehensive monitoring
 * - MCP (Model Context Protocol) for web search integration
 * 
 * The application is designed to help developers learn programming,
 * prepare for interviews, and advance their careers in technology.
 * 
 * @author AI Code Helper Team
 * @version 2.0.0
 * @since 1.0.0
 */
@SpringBootApplication
@Slf4j
public class AiCodeHelperApplication {

    public static void main(String[] args) {
        log.info("Starting AI Code Helper Application...");
        SpringApplication.run(AiCodeHelperApplication.class, args);
    }

    /**
     * Application startup banner and system information.
     */
    @Bean
    public ApplicationRunner applicationStartupRunner(Environment environment) {
        return args -> {
            String port = environment.getProperty("server.port", "8081");
            String contextPath = environment.getProperty("server.servlet.context-path", "/api");
            String activeProfile = environment.getProperty("spring.profiles.active", "default");
            
            log.info("╔══════════════════════════════════════════════════════════════╗");
            log.info("║                   AI Code Helper Service                     ║");
            log.info("║                      Successfully Started                    ║");
            log.info("╠══════════════════════════════════════════════════════════════╣");
            log.info("║  🚀 Server URL: http://localhost:{}{}                    ║", port, contextPath);
            log.info("║  📊 Health Check: http://localhost:{}{}/ai/health         ║", port, contextPath);
            log.info("║  🔧 Active Profile: {}                                ║", activeProfile);
            log.info("║  📚 Features: RAG, Streaming, Tools, Safety Guardrails      ║");
            log.info("╚══════════════════════════════════════════════════════════════╝");
        };
    }
}
