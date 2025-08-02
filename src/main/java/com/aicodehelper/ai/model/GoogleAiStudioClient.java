package com.aicodehelper.ai.model;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.List;

@Component
@Slf4j
public class GoogleAiStudioClient {

    @Value("${GOOGLE_AI_GEMINI_API_KEY}")
    private String apiKey;
    
    @Value("${google-ai.model-name:gemini-1.5-flash}")
    private String modelName;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GoogleAiStudioClient() {
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/models/")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String generateContent(String prompt) {
        try {
            if (apiKey == null || apiKey.contains("your-api-key-here")) {
                log.error("API key not configured properly: {}", apiKey);
                throw new IllegalArgumentException("GOOGLE_AI_GEMINI_API_KEY is not configured properly");
            }

            log.info("Generating content with model: {} for prompt: {}", modelName, prompt.substring(0, Math.min(50, prompt.length())));

            // Enhanced prompt to encourage proper code formatting with line breaks
            String enhancedPrompt = prompt + "\n\nIMPORTANT: When providing code examples:\n" +
                "1. Use markdown code blocks with language tags (```java, ```python, ```cpp, etc.)\n" +
                "2. Format code with proper line breaks and indentation\n" +
                "3. Each statement should be on its own line\n" +
                "4. Use proper spacing and structure\n" +
                "5. For single-line examples, still use code blocks";

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", enhancedPrompt)
                    ))
                ),
                "generationConfig", Map.of(
                    "temperature", 0.7,
                    "maxOutputTokens", 2000
                )
            );

            log.debug("Request body: {}", requestBody);

            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", 
                    modelName, apiKey);
            
            String response = webClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.debug("Raw API response: {}", response);
            String result = extractTextFromResponse(response);
            log.info("Extracted text response: {}", result.substring(0, Math.min(100, result.length())));
            
            return result;
            
        } catch (Exception e) {
            log.error("Error calling Google AI Studio API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate AI response: " + e.getMessage(), e);
        }
    }

    private String extractTextFromResponse(String response) {
        try {
            log.debug("Parsing response: {}", response);
            JsonNode jsonNode = objectMapper.readTree(response);
            
            if (!jsonNode.has("candidates") || jsonNode.path("candidates").isEmpty()) {
                log.error("No candidates found in response: {}", response);
                throw new RuntimeException("No candidates in AI response");
            }
            
            JsonNode firstCandidate = jsonNode.path("candidates").get(0);
            if (!firstCandidate.has("content")) {
                log.error("No content found in first candidate: {}", firstCandidate);
                throw new RuntimeException("No content in AI response candidate");
            }
            
            JsonNode content = firstCandidate.path("content");
            if (!content.has("parts") || content.path("parts").isEmpty()) {
                log.error("No parts found in content: {}", content);
                throw new RuntimeException("No parts in AI response content");
            }
            
            JsonNode firstPart = content.path("parts").get(0);
            if (!firstPart.has("text")) {
                log.error("No text found in first part: {}", firstPart);
                throw new RuntimeException("No text in AI response part");
            }
            
            String result = firstPart.path("text").asText();
            log.debug("Successfully extracted text: {}", result);
            return result;
            
        } catch (Exception e) {
            log.error("Error parsing Google AI response: {}", response, e);
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage(), e);
        }
    }
}