package com.aicodehelper.ai.guardrail;

import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.guardrail.InputGuardrail;
import dev.langchain4j.guardrail.InputGuardrailResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Input safety guardrail to filter inappropriate content.
 * This guardrail scans user input for sensitive words and blocks harmful content
 * before it reaches the AI model.
 */
@Component
@Slf4j
public class SafeInputGuardrail implements InputGuardrail {

    // Default sensitive words - can be extended via configuration
    private static final Set<String> DEFAULT_SENSITIVE_WORDS = Set.of(
        "kill", "murder", "violence", "harm", "attack", "destroy", 
        "hate", "abuse", "threat", "weapon", "bomb", "suicide"
    );

    @Value("${ai.guardrail.additional-sensitive-words:}")
    private String additionalSensitiveWords;

    private Set<String> getAllSensitiveWords() {
        Set<String> allWords = DEFAULT_SENSITIVE_WORDS.stream()
                .collect(Collectors.toSet());
        
        if (additionalSensitiveWords != null && !additionalSensitiveWords.trim().isEmpty()) {
            Arrays.stream(additionalSensitiveWords.split(","))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .forEach(allWords::add);
        }
        
        return allWords;
    }

    /**
     * Validates user input for safety and appropriateness.
     * 
     * @param userMessage The user's input message to validate
     * @return InputGuardrailResult indicating whether the input is safe
     */
    @Override
    public InputGuardrailResult validate(UserMessage userMessage) {
        // Convert input to lowercase for case-insensitive matching
        String inputText = userMessage.singleText().toLowerCase();
        
        // Split input into words using word boundaries
        String[] words = inputText.split("\\W+");
        
        Set<String> sensitiveWords = getAllSensitiveWords();
        
        // Check each word against sensitive word list
        for (String word : words) {
            if (sensitiveWords.contains(word.toLowerCase())) {
                log.warn("Sensitive word detected in user input: {}", word);
                return fatal("Input contains inappropriate content and has been blocked for safety reasons.");
            }
        }
        
        log.debug("Input passed safety validation");
        return success();
    }
}
