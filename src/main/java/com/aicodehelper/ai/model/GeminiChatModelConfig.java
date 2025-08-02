package com.aicodehelper.ai.model;

import dev.langchain4j.model.chat.ChatModel;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Google AI Gemini Chat Model Configuration
 * 
 * This configuration class creates and configures the Google AI Gemini chat model.
 * The model provides:
 * 
 * - Advanced natural language understanding and generation
 * - Support for multiple languages and multimodal capabilities
 * - Configurable temperature and response parameters
 * - Integration with LangChain4j framework
 * - Comprehensive logging and monitoring capabilities
 * 
 * The configuration is externalized through application.yml properties
 * for easy environment-specific customization.
 */
@Configuration
@Slf4j
public class GeminiChatModelConfig {

    @Resource
    private GoogleAiStudioChatModel googleAiStudioChatModel;

    /**
     * Creates and configures the primary Gemini chat model bean.
     * 
     * This model is used for:
     * - Basic chat interactions
     * - Structured output generation
     * - Integration with RAG and tool calling
     * 
     * @return Configured GoogleAiGeminiChatModel instance
     */
    @Bean
    public ChatModel myGeminiChatModel() {
        log.info("Initializing Google AI Studio Chat Model");
        return googleAiStudioChatModel;
    }
}