package com.aicodehelper.ai.tools;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Interview Question Search Tool
 * 
 * This tool searches for relevant interview questions from mianshiya.com
 * based on user-provided keywords. It's particularly useful for helping
 * users prepare for technical interviews in various programming domains.
 */
@Component
@Slf4j
public class InterviewQuestionTool {

    private static final String BASE_SEARCH_URL = "https://www.mianshiya.com/search/all?searchText=";
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    
    @Value("${ai.tools.web-scraper.timeout-seconds:10}")
    private int timeoutSeconds;

    @Value("${ai.tools.web-scraper.max-questions:20}")
    private int maxQuestions;

    /**
     * Searches for interview questions related to a specific keyword.
     * 
     * This tool scrapes mianshiya.com to find current interview questions
     * related to programming topics, technologies, or concepts.
     *
     * @param keyword Search term (e.g., "Java", "Redis", "Spring Boot", "algorithms")
     * @return List of relevant interview questions, or error message if search fails
     */
    @Tool(name = "searchInterviewQuestions", value = """
            Searches for relevant technical interview questions based on a keyword.
            Use this tool when users ask for interview questions about:
            - Specific programming languages (Java, Python, JavaScript, etc.)
            - Technologies and frameworks (Spring, React, Docker, etc.)
            - Computer science concepts (algorithms, data structures, etc.)
            - System design topics (scalability, databases, etc.)
            
            Provide a clear, specific keyword for best results.
            """)
    public String searchInterviewQuestions(@P("The technology, language, or concept to search for") String keyword) {
        log.info("Searching for interview questions with keyword: {}", keyword);
        
        List<String> questions = new ArrayList<>();
        
        try {
            // Encode keyword to handle special characters and non-ASCII characters
            String encodedKeyword = URLEncoder.encode(keyword.trim(), StandardCharsets.UTF_8);
            String searchUrl = BASE_SEARCH_URL + encodedKeyword;
            
            log.debug("Fetching interview questions from: {}", searchUrl);
            
            // Perform web scraping with timeout and user agent
            Document document = Jsoup.connect(searchUrl)
                    .userAgent(USER_AGENT)
                    .timeout(timeoutSeconds * 1000) // Convert seconds to milliseconds
                    .get();
            
            // Extract question elements from the page
            Elements questionElements = document.select(".ant-table-cell > a");
            
            // Process and collect questions
            questionElements.stream()
                    .limit(maxQuestions)
                    .forEach(element -> {
                        String questionText = element.text().trim();
                        if (!questionText.isEmpty()) {
                            questions.add(questionText);
                        }
                    });
            
            if (questions.isEmpty()) {
                log.warn("No interview questions found for keyword: {}", keyword);
                return String.format("No interview questions found for '%s'. Try using a different keyword or check if the topic exists.", keyword);
            }
            
            log.info("Found {} interview questions for keyword: {}", questions.size(), keyword);
            
            // Format the results
            StringBuilder result = new StringBuilder();
            result.append(String.format("Interview Questions for '%s':\n\n", keyword));
            
            for (int i = 0; i < questions.size(); i++) {
                result.append(String.format("%d. %s\n", i + 1, questions.get(i)));
            }
            
            return result.toString();
            
        } catch (IOException e) {
            log.error("Failed to fetch interview questions for keyword '{}': {}", keyword, e.getMessage(), e);
            return String.format("Unable to retrieve interview questions for '%s' due to network error: %s", 
                    keyword, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while searching for interview questions: {}", e.getMessage(), e);
            return String.format("An unexpected error occurred while searching for questions about '%s'. Please try again later.", keyword);
        }
    }
}