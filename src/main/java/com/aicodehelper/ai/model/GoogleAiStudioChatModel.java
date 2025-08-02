package com.aicodehelper.ai.model;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.output.Response;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class GoogleAiStudioChatModel implements ChatModel {

    private final GoogleAiStudioClient aiStudioClient;

    public GoogleAiStudioChatModel(GoogleAiStudioClient aiStudioClient) {
        this.aiStudioClient = aiStudioClient;
    }

    public Response<AiMessage> generate(List<ChatMessage> messages) {
        try {
            // Convert messages to a single prompt string
            StringBuilder promptBuilder = new StringBuilder();
            for (ChatMessage message : messages) {
                if (message instanceof UserMessage) {
                    UserMessage userMessage = (UserMessage) message;
                    promptBuilder.append("User: ").append(userMessage.singleText()).append("\n");
                } else {
                    promptBuilder.append(message.toString()).append("\n");
                }
            }
            
            String prompt = promptBuilder.toString().trim();
            log.debug("Sending prompt to Google AI Studio: {}", prompt);
            
            String responseText = aiStudioClient.generateContent(prompt);
            log.debug("Received response from Google AI Studio: {}", responseText);
            
            AiMessage aiMessage = AiMessage.from(responseText);
            
            return Response.from(aiMessage);
            
        } catch (Exception e) {
            log.error("Error generating response from Google AI Studio: {}", e.getMessage());
            throw new RuntimeException("Failed to generate AI response", e);
        }
    }

    @Override
    public String chat(String userMessage) {
        UserMessage message = UserMessage.from(userMessage);
        Response<AiMessage> response = generate(List.of(message));
        return response.content().text();
    }
}