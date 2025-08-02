// AI Code Helper API Client

import type {
  ChatRequest,
  StreamChatRequest,
  LearningReportRequest,
  KnowledgeBaseRequest,
  LearningReport,
  KnowledgeBaseResult,

} from '../types/api';

export class AiApiClient {
  private baseUrl: string;
  private abortController?: AbortController;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // Basic chat endpoint
  async chat(request: ChatRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.message),
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.statusText}`);
    }

    return response.text();
  }

  // Streaming chat with Server-Sent Events
  async *streamChat(request: StreamChatRequest): AsyncGenerator<string, void, unknown> {
    this.abortController = new AbortController();
    
    const params = new URLSearchParams({
      message: request.message,
      memoryId: (request.memoryId || 1).toString(),
    });

    const response = await fetch(`${this.baseUrl}/ai/chat/stream?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      signal: this.abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Stream API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5); // Remove 'data:' but preserve spaces
            if (data === '[DONE]') {
              return;
            }
            if (data && data !== 'null' && data !== '') {
              // Unescape newlines that were escaped for SSE transmission
              const unescapedData = data.replace(/\\n/g, '\n');
              yield unescapedData;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Generate learning report
  async generateLearningReport(request: LearningReportRequest): Promise<LearningReport> {
    const response = await fetch(`${this.baseUrl}/ai/learning-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: request.message }),
    });

    if (!response.ok) {
      throw new Error(`Learning Report API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Backend now returns structured JSON
    return {
      studentName: result.studentName || 'Student',
      recommendations: result.recommendations || [result.error || 'No recommendations available']
    };
  }

  // Knowledge base search
  async searchKnowledgeBase(request: KnowledgeBaseRequest): Promise<KnowledgeBaseResult> {
    const response = await fetch(`${this.baseUrl}/ai/chat/knowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: request.message }),
    });

    if (!response.ok) {
      throw new Error(`Knowledge Base API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Backend now returns structured JSON with content and sources
    return {
      content: result.content || result.error || 'No response',
      sources: result.sources || []
    };
  }

  // Health check
  async healthCheck(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/ai/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.text();
  }

  // Cancel ongoing stream
  cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const aiApiClient = new AiApiClient();