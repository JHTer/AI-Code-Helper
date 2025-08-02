package com.aicodehelper.ai;

import com.aicodehelper.ai.tools.InterviewQuestionTool;
import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;

import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.service.AiServices;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Factory class for creating and configuring the AI Code Helper Service.
 * This factory creates a comprehensive AI service with:
 * - Chat and streaming chat models
 * - Conversation memory management
 * - RAG (Retrieval Augmented Generation) capabilities
 * - Tool integration (Interview Questions, Web Search via MCP)
 * - Input safety guardrails
 */
@Configuration
@Slf4j
public class AiCodeHelperServiceFactory {

    @Resource
    private ChatModel myGeminiChatModel;



    @Resource
    private ContentRetriever contentRetriever;

    @Resource
    private McpToolProvider mcpToolProvider;

    @Value("${ai.chat.memory.max-messages:10}")
    private int maxMemoryMessages;

    /**
     * Creates the main AI service with all advanced features enabled.
     * 
     * @return Fully configured AiCodeHelperService instance
     */
    @Bean
    public AiCodeHelperService aiCodeHelperService() {
        log.info("Initializing AI Code Helper Service with max memory messages: {}", maxMemoryMessages);
        
        // Configure conversation memory for default session
        ChatMemory defaultChatMemory = MessageWindowChatMemory.withMaxMessages(maxMemoryMessages);
        
        // Build the comprehensive AI service
        AiCodeHelperService service = AiServices.builder(AiCodeHelperService.class)
                .chatModel(myGeminiChatModel)

                .chatMemory(defaultChatMemory)
                .chatMemoryProvider(sessionId -> 
                        MessageWindowChatMemory.withMaxMessages(maxMemoryMessages)) // Independent memory per session
                .contentRetriever(contentRetriever) // Enable RAG with knowledge base
                .tools(new InterviewQuestionTool()) // Add interview question search tool
                .toolProvider(mcpToolProvider) // Add MCP web search capabilities
                .build();
        
        log.info("AI Code Helper Service successfully initialized");
        return service;
    }
}
