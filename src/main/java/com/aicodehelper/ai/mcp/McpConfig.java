package com.aicodehelper.ai.mcp;

import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.mcp.client.DefaultMcpClient;
import dev.langchain4j.mcp.client.McpClient;
import dev.langchain4j.mcp.client.transport.McpTransport;
import dev.langchain4j.mcp.client.transport.http.HttpMcpTransport;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MCP (Model Context Protocol) Configuration
 * 
 * This configuration sets up the MCP client for web search capabilities.
 * MCP provides the AI with access to real-time web information through
 * the BigModel API, enabling it to:
 * 
 * - Search for current programming trends and news
 * - Find up-to-date documentation and tutorials
 * - Access recent technical discussions and solutions
 * - Provide current job market information
 * 
 * The MCP integration enhances the AI's responses with fresh, relevant data
 * beyond the static knowledge base.
 */
@Configuration
@Slf4j
public class McpConfig {

    private static final String MCP_CLIENT_KEY = "aiCodeHelperMcpClient";
    private static final String BIGMODEL_SSE_BASE_URL = "https://open.bigmodel.cn/api/mcp/web_search/sse";

    @Value("${bigmodel.api-key}")
    private String apiKey;

    @Value("${ai.mcp.enable-request-logging:false}")
    private boolean enableRequestLogging;

    @Value("${ai.mcp.enable-response-logging:false}")
    private boolean enableResponseLogging;

    /**
     * Creates and configures the MCP tool provider for web search capabilities.
     * 
     * @return Configured McpToolProvider for real-time web searches
     */
    @Bean
    public McpToolProvider mcpToolProvider() {
        log.info("Initializing MCP (Model Context Protocol) client for web search");
        
        try {
            // Validate API key
            if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("<Your")) {
                log.warn("BigModel API key is not configured. MCP web search will be disabled.");
                return createDisabledMcpToolProvider();
            }
            
            // Configure HTTP transport for MCP communication
            String sseUrl = BIGMODEL_SSE_BASE_URL + "?Authorization=" + apiKey;
            log.debug("Configuring MCP transport with URL: {}", BIGMODEL_SSE_BASE_URL);
            
            McpTransport transport = new HttpMcpTransport.Builder()
                    .sseUrl(sseUrl)
                    .logRequests(enableRequestLogging) // Configure request logging
                    .logResponses(enableResponseLogging) // Configure response logging
                    .build();
            
            // Create MCP client with unique identifier
            McpClient mcpClient = new DefaultMcpClient.Builder()
                    .key(MCP_CLIENT_KEY)
                    .transport(transport)
                    .build();
            
            // Build tool provider from MCP client
            McpToolProvider toolProvider = McpToolProvider.builder()
                    .mcpClients(mcpClient)
                    .build();
            
            log.info("MCP tool provider initialized successfully");
            return toolProvider;
            
        } catch (Exception e) {
            log.error("Failed to initialize MCP tool provider: {}", e.getMessage(), e);
            log.warn("Falling back to disabled MCP tool provider");
            return createDisabledMcpToolProvider();
        }
    }

    /**
     * Creates a disabled MCP tool provider when configuration is invalid or fails.
     * 
     * @return Empty McpToolProvider that won't perform web searches
     */
    private McpToolProvider createDisabledMcpToolProvider() {
        return McpToolProvider.builder().mcpClients(java.util.Collections.emptyList()).build();
    }
}
