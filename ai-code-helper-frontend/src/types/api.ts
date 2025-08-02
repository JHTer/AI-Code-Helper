// TypeScript types for AI Code Helper API

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  type?: 'chat' | 'report' | 'knowledge' | 'error';
}

export interface LearningReport {
  studentName: string;
  recommendations: string[];
}

export interface KnowledgeBaseResult {
  content: string;
  sources: ContentSource[];
}

export interface ContentSource {
  id: string;
  text: string;
  metadata: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastActivity: Date;
  type: 'general' | 'learning' | 'interview';
}

export interface AppSettings {
  autoSave: boolean;
  enableNotifications: boolean;
  showTimestamps: boolean;
  theme: 'windows95';
}

export interface ConnectionStatus {
  connected: boolean;
  lastPing: Date | null;
  error?: string;
}

// API Request types
export interface ChatRequest {
  message: string;
  sessionId?: number;
}

export interface StreamChatRequest {
  message: string;
  memoryId?: number;
}

export interface LearningReportRequest {
  message: string;
}

export interface KnowledgeBaseRequest {
  message: string;
}

// Event types for Server-Sent Events
export interface SSEMessage {
  data: string;
  type?: string;
  id?: string;
}