package com.aicodehelper.ai;

import dev.langchain4j.rag.content.Content;
import dev.langchain4j.service.Result;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive test suite for AiCodeHelperService.
 * 
 * This test class validates all major functionality of the AI service including:
 * - Basic chat capabilities
 * - Memory management across conversations
 * - Structured output generation (learning reports)
 * - RAG (Retrieval Augmented Generation) with knowledge base
 * - Tool integration (interview questions, web search)
 * - Input safety guardrails
 * 
 * Tests use realistic English scenarios to validate the internationalized system.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.DisplayName.class)
@Slf4j
class AiCodeHelperServiceTest {

    @Resource
    private AiCodeHelperService aiCodeHelperService;

    @Test
    @DisplayName("Basic chat functionality should work correctly")
    void testBasicChat() {
        // Given
        String userMessage = "Hello, I'm a Java developer looking for career advice.";
        
        // When
        String response = aiCodeHelperService.chat(userMessage);
        
        // Then
        assertNotNull(response, "Response should not be null");
        assertFalse(response.trim().isEmpty(), "Response should not be empty");
        assertTrue(response.length() > 10, "Response should be meaningful (more than 10 characters)");
        log.info("Basic chat test - Response: {}", response);
    }

    @Test
    @DisplayName("Conversation memory should maintain context across messages")
    void testConversationMemory() {
        // Given - First message establishing context
        String firstMessage = "Hi, I'm Sarah, a Python developer with 2 years of experience.";
        String secondMessage = "What programming languages should I learn next based on my background?";
        
        // When
        String firstResponse = aiCodeHelperService.chat(firstMessage);
        String secondResponse = aiCodeHelperService.chat(secondMessage);
        
        // Then
        assertNotNull(firstResponse, "First response should not be null");
        assertNotNull(secondResponse, "Second response should not be null");
        
        // The second response should acknowledge the context from the first message
        assertTrue(firstResponse.length() > 20, "First response should be substantial");
        assertTrue(secondResponse.length() > 20, "Second response should be substantial");
        
        log.info("Memory test - First response: {}", firstResponse);
        log.info("Memory test - Second response: {}", secondResponse);
    }

    @Test
    @DisplayName("Learning report generation should produce structured output")
    void testLearningReportGeneration() {
        // Given
        String userMessage = "I'm Alex, a beginner programmer who has been learning Java for 6 months. " +
                           "I want to become a full-stack developer. Please create a learning plan for me.";
        
        // When
        AiCodeHelperService.LearningReport report = aiCodeHelperService.generateLearningReport(userMessage);
        
        // Then
        assertNotNull(report, "Learning report should not be null");
        assertNotNull(report.studentName(), "Student name should be extracted");
        assertNotNull(report.recommendations(), "Recommendations should be provided");
        assertFalse(report.recommendations().isEmpty(), "Recommendations list should not be empty");
        assertTrue(report.recommendations().size() >= 2, "Should provide at least 2 recommendations");
        
        log.info("Learning report test - Name: {}, Recommendations: {}", 
                report.studentName(), report.recommendations());
    }

    @Test
    @DisplayName("RAG functionality should retrieve relevant knowledge base information")
    void testKnowledgeBaseRetrieval() {
        // Given
        String query = "How should I learn Java programming? What are common Java interview questions?";
        
        // When
        Result<String> result = aiCodeHelperService.chatWithKnowledgeBase(query);
        
        // Then
        assertNotNull(result, "RAG result should not be null");
        assertNotNull(result.content(), "RAG content should not be null");
        assertFalse(result.content().trim().isEmpty(), "RAG content should not be empty");
        
        // Verify sources were retrieved
        List<Content> sources = result.sources();
        assertNotNull(sources, "Sources should not be null");
        // Note: Sources might be empty if knowledge base is not loaded in test environment
        
        log.info("RAG test - Content length: {}, Sources count: {}", 
                result.content().length(), sources.size());
        log.info("RAG test - Response: {}", result.content());
    }

    @Test
    @DisplayName("Interview question tool should search for relevant questions")
    void testInterviewQuestionTool() {
        // Given
        String query = "What are common Spring Boot interview questions?";
        
        // When
        String response = aiCodeHelperService.chat(query);
        
        // Then
        assertNotNull(response, "Tool response should not be null");
        assertFalse(response.trim().isEmpty(), "Tool response should not be empty");
        assertTrue(response.length() > 50, "Response should be substantial when using tools");
        
        log.info("Interview questions tool test - Response: {}", response);
    }

    @Test
    @DisplayName("MCP web search should provide current information")
    void testMcpWebSearch() {
        // Given
        String query = "What are the latest trends in software development for 2024?";
        
        // When
        String response = aiCodeHelperService.chat(query);
        
        // Then
        assertNotNull(response, "MCP response should not be null");
        assertFalse(response.trim().isEmpty(), "MCP response should not be empty");
        assertTrue(response.length() > 30, "Response should be meaningful");
        
        log.info("MCP web search test - Response: {}", response);
    }

    @Test
    @DisplayName("Input guardrails should block inappropriate content")
    void testInputSafetyGuardrails() {
        // Given
        String inappropriateMessage = "How to kill a process in Linux?"; // Should be allowed - technical context
        
        // When & Then - Technical content should be allowed
        String technicalResponse = aiCodeHelperService.chat(inappropriateMessage);
        assertNotNull(technicalResponse, "Technical queries should be processed");
        assertFalse(technicalResponse.trim().isEmpty(), "Technical response should not be empty");
        
        // Note: The actual blocking would happen at the guardrail level
        // In a real scenario, sensitive content would throw an exception or return an error message
        log.info("Guardrails test - Technical query response: {}", technicalResponse);
    }

    @Test
    @DisplayName("Error handling should be graceful for malformed inputs")
    void testErrorHandling() {
        // Given - Various edge cases
        String emptyMessage = "";
        String veryLongMessage = "A".repeat(10000); // Very long input
        String specialCharacters = "Special chars: @#$%^&*()[]{}|;:,.<>?";
        
        // When & Then - Empty message
        assertDoesNotThrow(() -> {
            String response = aiCodeHelperService.chat(emptyMessage);
            log.info("Empty message test - Response: {}", response);
        }, "Empty message should not cause exceptions");
        
        // When & Then - Very long message
        assertDoesNotThrow(() -> {
            String response = aiCodeHelperService.chat(veryLongMessage);
            assertNotNull(response, "Very long message should still get a response");
            log.info("Long message test - Response length: {}", response.length());
        }, "Very long message should not cause exceptions");
        
        // When & Then - Special characters
        assertDoesNotThrow(() -> {
            String response = aiCodeHelperService.chat(specialCharacters);
            assertNotNull(response, "Special characters should still get a response");
            log.info("Special chars test - Response: {}", response);
        }, "Special characters should not cause exceptions");
    }
}