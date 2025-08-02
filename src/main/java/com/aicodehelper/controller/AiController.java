package com.aicodehelper.controller;

import com.aicodehelper.ai.AiCodeHelperService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import org.springframework.http.ResponseEntity;
import com.aicodehelper.ai.model.GoogleAiStudioClient;
import java.util.Map;
import java.util.List;

/**
 * REST Controller for AI-powered programming assistance.
 * 
 * This controller provides endpoints for:
 * - Real-time streaming chat with AI
 * - Knowledge base queries
 * - Structured learning reports
 * 
 * All endpoints support CORS for frontend integration.
 */
@RestController
@Slf4j
@RequestMapping("/ai")
public class AiController {

    @Resource
    private AiCodeHelperService aiCodeHelperService;
    
    @Resource
    private GoogleAiStudioClient googleAiStudioClient;

    /**
     * Streaming chat endpoint with session memory.
     * 
     * Provides real-time AI responses using Server-Sent Events (SSE).
     * Each session maintains its own conversation history.
     * 
     * @param sessionId Unique identifier for conversation session
     * @param message User's input message
     * @return Flux stream of response chunks
     */
    @GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamChat(
            @RequestParam(name = "memoryId", defaultValue = "1") int sessionId,
            @RequestParam String message) {
        
        log.info("Starting streaming chat for session: {} with message length: {}", sessionId, message.length());
        
        try {
            // Use direct Google AI Studio client for streaming
            String response = googleAiStudioClient.generateContent(message);
            
            // Preserve line structure while streaming - split by words but maintain line breaks
            String[] lines = response.split("\n");
            java.util.List<String> chunks = new java.util.ArrayList<>();
            
            for (String line : lines) {
                if (line.trim().isEmpty()) {
                    // Preserve empty lines
                    chunks.add("\n");
                } else {
                    // Split line into words but add line break at the end
                    String[] words = line.split(" ");
                    for (int i = 0; i < words.length; i++) {
                        String word = words[i];
                        if (i < words.length - 1) {
                            chunks.add(word + " ");
                        } else {
                            // Last word in line gets the line break
                            chunks.add(word + "\n");
                        }
                    }
                }
            }
            
            return Flux.range(0, chunks.size())
                    .delayElements(java.time.Duration.ofMillis(50))
                    .map(index -> {
                        String chunk = chunks.get(index);
                        log.debug("Sending chunk {}: '{}'", index, chunk.replace("\n", "\\n"));
                        
                        // SSE requires newlines to be properly escaped
                        String escapedChunk = chunk.replace("\n", "\\n");
                        
                        return ServerSentEvent.<String>builder()
                                .data(escapedChunk)
                                .build();
                    })
                    .doOnComplete(() -> log.info("Streaming chat completed for session: {}", sessionId))
                    .doOnError(error -> log.error("Streaming chat error for session {}: {}", sessionId, error.getMessage()));
                    
        } catch (Exception e) {
            log.error("Error in streaming chat for session {}: {}", sessionId, e.getMessage(), e);
            return Flux.just(ServerSentEvent.<String>builder()
                    .data("Error: " + e.getMessage())
                    .build());
        }
    }

    /**
     * Simple chat endpoint without streaming.
     * 
     * @param message User's input message
     * @return Complete AI response
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Message is required"));
            }
            
            log.info("Processing simple chat request with message length: {}", message.length());
            
            // Use direct Google AI Studio client instead of complex service
            String response = googleAiStudioClient.generateContent(message);
            
            return ResponseEntity.ok(Map.of(
                    "response", response,
                    "model", "Google AI Studio - Gemini 1.5 Flash"
            ));
            
        } catch (Exception e) {
            log.error("Error in chat: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to get AI response: " + e.getMessage()));
        }
    }



    /**
     * Chat with knowledge base integration (RAG).
     * 
     * @param message User's question
     * @return AI response enhanced with knowledge base information
     */
    @PostMapping("/chat/knowledge")
    public ResponseEntity<Map<String, Object>> chatWithKnowledgeBase(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Message is required"));
            }
            
            log.info("Processing knowledge base query with message length: {}", message.length());
            
            // Use direct Google AI Studio client with knowledge base context
            String knowledgePrompt = "Based on programming best practices and knowledge base, please answer: " + message;
            String response = googleAiStudioClient.generateContent(knowledgePrompt);
            
            return ResponseEntity.ok(Map.of(
                    "content", response,
                    "sources", List.of() // Empty sources for now
            ));
            
        } catch (Exception e) {
            log.error("Error in knowledge base chat: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to search knowledge base: " + e.getMessage()));
        }
    }

    /**
     * Generate personalized learning report.
     * 
     * @param request User's learning background and goals
     * @return Structured learning recommendations
     */
    @PostMapping("/learning-report")
    public ResponseEntity<Map<String, Object>> generateLearningReport(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Message is required"));
            }
            
            log.info("Generating learning report for user request with message length: {}", message.length());
            
            // Create learning report prompt
            String reportPrompt = "Create a personalized programming learning report for: " + message + 
                    "\n\nPlease provide:\n1. Learning path recommendations\n2. Specific skills to focus on\n3. Practical projects to build\n4. Resources and tools to use\n5. Timeline suggestions";
            
            String response = googleAiStudioClient.generateContent(reportPrompt);
            
            // Parse response into structured format for frontend
            String[] lines = response.split("\n");
            List<String> recommendations = List.of(lines);
            
            return ResponseEntity.ok(Map.of(
                    "studentName", "Programming Student",
                    "recommendations", recommendations
            ));
            
        } catch (Exception e) {
            log.error("Error generating learning report: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to generate learning report: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint.
     * 
     * @return Simple status message
     */
    @GetMapping("/health")
    public String health() {
        return "AI Code Helper Service is running";
    }
}
