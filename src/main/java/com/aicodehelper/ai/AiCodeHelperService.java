package com.aicodehelper.ai;

import com.aicodehelper.ai.guardrail.SafeInputGuardrail;
import dev.langchain4j.service.*;
import dev.langchain4j.service.guardrail.InputGuardrails;
import reactor.core.publisher.Flux;

import java.util.List;

/**
 * Advanced AI service interface with comprehensive features.
 * This service provides advanced capabilities including:
 * - Conversation memory management
 * - RAG (Retrieval Augmented Generation)
 * - Streaming responses
 * - Structured output generation
 * - Input safety guardrails
 * 
 * Note: Manually built for greater flexibility instead of using @AiService
 */
@InputGuardrails({SafeInputGuardrail.class})
public interface AiCodeHelperService {

    /**
     * Basic chat with system prompt from external file.
     * 
     * @param userMessage User's input message
     * @return AI response as string
     */
    @SystemMessage(fromResource = "system-prompt.txt")
    String chat(String userMessage);

    /**
     * Generate structured learning report.
     * 
     * @param userMessage User's request for learning guidance
     * @return Structured report with recommendations
     */
    @SystemMessage(fromResource = "system-prompt.txt")
    LearningReport generateLearningReport(String userMessage);

    /**
     * Learning report structure containing personalized recommendations.
     */
    record LearningReport(String studentName, List<String> recommendations) {
    }

    /**
     * Chat with RAG (Retrieval Augmented Generation) support.
     * Retrieves relevant information from knowledge base before generating response.
     * 
     * @param userMessage User's question
     * @return Result containing response and source references
     */
    @SystemMessage(fromResource = "system-prompt.txt")
    Result<String> chatWithKnowledgeBase(String userMessage);

    /**
     * Streaming chat with conversation memory.
     * Provides real-time response streaming with session memory.
     * 
     * @param sessionId Unique session identifier for memory management
     * @param userMessage User's input message
     * @return Flux stream of response chunks
     */
    Flux<String> chatStream(@MemoryId int sessionId, @UserMessage String userMessage);
}
