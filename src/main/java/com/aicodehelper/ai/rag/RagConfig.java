package com.aicodehelper.ai.rag;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.splitter.DocumentByParagraphSplitter;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * RAG (Retrieval Augmented Generation) Configuration
 * 
 * This configuration sets up the knowledge base system that enhances AI responses
 * with relevant information from document sources. The RAG system includes:
 * 
 * - Document loading from the knowledge base directory
 * - Text segmentation with configurable chunk size and overlap
 * - Vector embedding generation for semantic search
 * - Content retrieval with similarity scoring
 * 
 * The knowledge base contains programming guides, interview questions,
 * career advice, and learning resources.
 */
@Configuration
@Slf4j
public class RagConfig {

    @Resource
    private EmbeddingModel embeddingModel;

    @Resource
    private EmbeddingStore<TextSegment> embeddingStore;

    @Value("${ai.rag.document-path:src/main/resources/docs}")
    private String documentPath;

    @Value("${ai.rag.chunk-size:1000}")
    private int chunkSize;

    @Value("${ai.rag.chunk-overlap:200}")
    private int chunkOverlap;

    @Value("${ai.rag.max-results:5}")
    private int maxResults;

    @Value("${ai.rag.min-score:0.75}")
    private double minScore;

    /**
     * Creates and configures the content retriever for RAG functionality.
     * 
     * This method:
     * 1. Loads documents from the knowledge base directory
     * 2. Splits documents into manageable chunks with overlap
     * 3. Generates embeddings for semantic search
     * 4. Configures retrieval parameters for optimal results
     * 
     * @return Configured ContentRetriever for knowledge base queries
     */
    @Bean
    public ContentRetriever contentRetriever() {
        log.info("Initializing RAG system with document path: {}", documentPath);
        
        try {
            // Step 1: Load documents from knowledge base
            List<Document> documents = FileSystemDocumentLoader.loadDocuments(documentPath);
            log.info("Loaded {} documents from knowledge base", documents.size());
            
            // Step 2: Configure document splitter with optimized parameters
            DocumentByParagraphSplitter paragraphSplitter = new DocumentByParagraphSplitter(chunkSize, chunkOverlap);
            log.debug("Configured document splitter - chunk size: {}, overlap: {}", chunkSize, chunkOverlap);
            
            // Step 3: Create embedding store ingestor with metadata enhancement
            EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                    .documentSplitter(paragraphSplitter)
                    // Enhance text segments with source file information for better context
                    .textSegmentTransformer(textSegment -> {
                        String fileName = textSegment.metadata().getString("file_name");
                        String enhancedText = String.format("Source: %s\n\n%s", fileName, textSegment.text());
                        return TextSegment.from(enhancedText, textSegment.metadata());
                    })
                    .embeddingModel(embeddingModel)
                    .embeddingStore(embeddingStore)
                    .build();
            
            // Step 4: Process and ingest documents
            log.info("Processing documents and generating embeddings...");
            ingestor.ingest(documents);
            log.info("Successfully ingested documents into embedding store");
            
            // Step 5: Configure content retriever with performance parameters
            ContentRetriever retriever = EmbeddingStoreContentRetriever.builder()
                    .embeddingStore(embeddingStore)
                    .embeddingModel(embeddingModel)
                    .maxResults(maxResults) // Limit results for performance
                    .minScore(minScore) // Filter low-relevance results
                    .build();
            
            log.info("RAG system initialized successfully - max results: {}, min score: {}", maxResults, minScore);
            return retriever;
            
        } catch (Exception e) {
            log.error("Failed to initialize RAG system: {}", e.getMessage(), e);
            throw new RuntimeException("RAG initialization failed", e);
        }
    }
}
