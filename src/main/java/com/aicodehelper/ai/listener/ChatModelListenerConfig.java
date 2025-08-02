package com.aicodehelper.ai.listener;

import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.model.chat.listener.ChatModelErrorContext;
import dev.langchain4j.model.chat.listener.ChatModelListener;
import dev.langchain4j.model.chat.listener.ChatModelRequestContext;
import dev.langchain4j.model.chat.listener.ChatModelResponseContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.util.List;

/**
 * Configuration for chat model event listeners.
 * Provides comprehensive monitoring and logging of AI model interactions
 * including request/response timing, token usage, and error tracking.
 */
@Configuration
@Slf4j
public class ChatModelListenerConfig {
    
    @Value("${ai.monitoring.detailed-logging:false}")
    private boolean detailedLogging;
    
    @Value("${ai.monitoring.log-user-messages:false}")
    private boolean logUserMessages;

    /**
     * Creates a comprehensive chat model listener for monitoring AI interactions.
     * 
     * @return Configured ChatModelListener instance
     */
    @Bean
    public ChatModelListener chatModelListener() {
        return new ChatModelListener() {
            
            @Override
            public void onRequest(ChatModelRequestContext requestContext) {
                Instant requestTime = Instant.now();
                
                if (detailedLogging) {
                    List<ChatMessage> messages = requestContext.chatRequest().messages();
                    log.info("AI Request initiated - Messages count: {}", messages.size());
                    
                    if (logUserMessages) {
                        messages.forEach(message -> 
                            log.debug("Message [{}]: {}", message.type(), message.toString()));
                    }
                } else {
                    log.info("AI Request initiated at {}", requestTime);
                }
            }

            @Override
            public void onResponse(ChatModelResponseContext responseContext) {
                if (detailedLogging) {
                    var response = responseContext.chatResponse();
                    var tokenUsage = response.tokenUsage();
                    
                    log.info("AI Response received - Finish reason: {}, Token usage: {} input, {} output, {} total", 
                            response.finishReason(),
                            tokenUsage != null ? tokenUsage.inputTokenCount() : "unknown",
                            tokenUsage != null ? tokenUsage.outputTokenCount() : "unknown",
                            tokenUsage != null ? tokenUsage.totalTokenCount() : "unknown");
                            
                    log.debug("AI Response content: {}", response.aiMessage().text());
                } else {
                    log.info("AI Response received successfully");
                }
            }

            @Override
            public void onError(ChatModelErrorContext errorContext) {
                log.error("AI Model Error occurred: {}", errorContext.error().getMessage(), errorContext.error());
                
                // Log additional context if available
                if (errorContext.error().getCause() != null) {
                    log.error("Root cause: {}", errorContext.error().getCause().getMessage());
                }
            }
        };
    }
}