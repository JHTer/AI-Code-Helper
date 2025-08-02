package com.aicodehelper.ai.model;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


/**
 * Provides a minimal in-memory embedding setup so that the application can
 * start without external embedding services or ONNX models. It returns a
 * zero-vector embedding for any input which is sufficient for development
 * and unit-test usage.
 */
@Configuration
public class LocalEmbeddingConfig {

    /**
     * Dummy embedding model that returns a single-dimension zero vector for all inputs.
     */
    @Bean
    public EmbeddingModel embeddingModel() {
        return texts -> Response.from(
                texts.stream()
                        .map(t -> new Embedding(new float[]{0f}))
                        .toList()
        );
    }

    /**
     * Simple in-memory vector store.
     */
    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        return new InMemoryEmbeddingStore<>();
    }
}
