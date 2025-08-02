// Utility functions for message handling

import type { ChatMessage } from '../types/api';

export function createMessage(
  sender: 'user' | 'ai' | 'system',
  content: string,
  type: 'chat' | 'report' | 'knowledge' | 'error' = 'chat'
): ChatMessage {
  return {
    id: generateMessageId(),
    sender,
    content,
    timestamp: new Date(),
    type
  };
}

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function getSenderLabel(sender: 'user' | 'ai' | 'system'): string {
  switch (sender) {
    case 'user':
      return '[USER] You';
    case 'ai':
      return '[AI] Assistant';
    case 'system':
      return '[SYSTEM] Info';
    default:
      return '[UNKNOWN]';
  }
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

export function isValidMessage(message: string): boolean {
  return message.trim().length > 0 && message.trim().length <= 4000;
}

// Windows 95 style message formatting
export function formatLearningReport(report: { studentName: string; recommendations: string[] }): string {
  let formatted = `Learning Report for: ${report.studentName}\n\n`;
  
  report.recommendations.forEach((recommendation, index) => {
    formatted += `${index + 1}. ${recommendation}\n`;
  });
  
  return formatted;
}

export function createSystemWelcomeMessage(): ChatMessage {
  return createMessage(
    'system',
    'Welcome to AI Code Helper! I\'m your programming assistant specialized in helping with learning, career guidance, and interview preparation. How can I help you today?',
    'chat'
  );
}