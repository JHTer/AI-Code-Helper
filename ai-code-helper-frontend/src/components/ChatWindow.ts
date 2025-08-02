// Windows 95 Style Chat Window Component

import type { ChatMessage, ChatSession, AppSettings } from '../types/api';
import { aiApiClient } from '../api/aiClient';
import { createMessage, formatTimestamp, getSenderLabel, createSystemWelcomeMessage } from '../utils/messageUtils';

export class ChatWindow {
  private container: HTMLElement;
  private chatDisplay!: HTMLElement;
  private messageInput!: HTMLTextAreaElement;
  private sendButton!: HTMLButtonElement;
  private currentSession: ChatSession;
  private settings: AppSettings;
  private isStreaming = false;
  private autoScrollEnabled = true;
  private lastScrollTime = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.currentSession = this.createNewSession();
    this.settings = this.loadSettings();
    this.init();
  }

  private init(): void {
    this.render();
    this.attachEventListeners();
    this.addMessage(createSystemWelcomeMessage());
    this.loadChatHistory();
    this.testConnection();
  }

  private createNewSession(): ChatSession {
    return {
      id: `session_${Date.now()}`,
      title: 'New Chat Session',
      messages: [],
      lastActivity: new Date(),
      type: 'general'
    };
  }

  private loadSettings(): AppSettings {
    const saved = localStorage.getItem('ai-helper-settings');
    return saved ? JSON.parse(saved) : {
      autoSave: true,
      enableNotifications: false,
      showTimestamps: true,
      theme: 'windows95'
    };
  }

  private render(): void {
    this.container.innerHTML = `
      <!-- Desktop Background -->
      <div class="desktop">
        <!-- Taskbar -->
        <div class="taskbar">
          <button class="start-button">Start</button>
          <div class="task-buttons">
            <button class="task-button active">AI Code Helper</button>
          </div>
          <div class="system-tray">
            <span class="time" id="currentTime">12:00 PM</span>
          </div>
        </div>

        <!-- Main Application Window -->
        <div class="window" id="mainWindow">
          <!-- Title Bar -->
          <div class="title-bar">
            <div class="title-bar-text">AI Code Helper - Programming Assistant</div>
            <div class="title-bar-controls">
              <button class="title-bar-control" id="minimize">_</button>
              <button class="title-bar-control" id="maximize">□</button>
              <button class="title-bar-control close" id="close">×</button>
            </div>
          </div>

          <!-- Menu Bar -->
          <div class="menu-bar">
            <button class="menu-item">File</button>
            <button class="menu-item">Edit</button>
            <button class="menu-item">AI Tools</button>
            <button class="menu-item">Help</button>
          </div>

          <!-- Toolbar -->
          <div class="toolbar">
            <button class="toolbar-button" id="newChatBtn" title="New Chat">
              <span class="icon-text">NEW</span>
            </button>
            <button class="toolbar-button" id="saveChatBtn" title="Save Conversation">
              <span class="icon-text">SAVE</span>
            </button>
            <div class="toolbar-separator"></div>
            <button class="toolbar-button" id="reportBtn" title="Learning Report">
              <span class="icon-text">RPT</span>
            </button>
            <button class="toolbar-button" id="questionsBtn" title="Interview Questions">
              <span class="icon-text">Q&A</span>
            </button>
            <button class="toolbar-button" id="knowledgeBtn" title="Knowledge Base">
              <span class="icon-text">KB</span>
            </button>
          </div>

          <!-- Main Content Area -->
          <div class="content-area">
            <!-- Chat Display -->
            <div class="chat-panel">
              <div class="chat-display" id="chatDisplay">
                <!-- Messages will be added here -->
              </div>

              <!-- Input Area -->
              <div class="input-panel">
                <div class="input-container">
                  <textarea class="message-input" id="messageInput" 
                           placeholder="Type your message here..." 
                           rows="3"></textarea>
                  <div class="input-controls">
                    <button class="send-button" id="sendBtn">Send</button>
                    <button class="ai-function-button" id="chatBtn">Chat</button>
                    <button class="ai-function-button" id="reportBtn2">Report</button>
                    <button class="ai-function-button" id="searchBtn">Search</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="sidebar">
              <div class="panel">
                <div class="panel-header">Quick Actions</div>
                <div class="panel-content">
                  <button class="action-button" id="newChatAction">* Start New Chat</button>
                  <button class="action-button" id="reportAction">* Generate Learning Report</button>
                  <button class="action-button" id="questionsAction">* Get Interview Questions</button>
                  <button class="action-button" id="knowledgeAction">* Search Knowledge Base</button>
                </div>
              </div>

              <div class="panel">
                <div class="panel-header">Chat History</div>
                <div class="panel-content" id="chatHistory">
                  <div class="chat-history-item active">Current Session</div>
                </div>
              </div>

              <div class="panel">
                <div class="panel-header">Settings</div>
                <div class="panel-content">
                  <label class="checkbox-label">
                    <input type="checkbox" id="autoSave" ${this.settings.autoSave ? 'checked' : ''}> 
                    Auto-save conversations
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" id="enableNotifications" ${this.settings.enableNotifications ? 'checked' : ''}> 
                    Enable notifications
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" id="showTimestamps" ${this.settings.showTimestamps ? 'checked' : ''}> 
                    Show timestamps
                  </label>
                  <div class="settings-info">
                    <small> Double-click chat area to toggle auto-scroll</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Bar -->
          <div class="status-bar">
            <div class="status-section" id="connectionStatus">Connecting...</div>
            <div class="status-section" id="aiStatus">AI Service Status</div>
            <div class="status-section" id="memoryStatus">Memory: 0/10 messages</div>
          </div>
        </div>
      </div>
    `;

    // Get references to important elements
    this.chatDisplay = this.container.querySelector('#chatDisplay')!;
    this.messageInput = this.container.querySelector('#messageInput')!;
    this.sendButton = this.container.querySelector('#sendBtn')!;

    // Update time every second
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  private attachEventListeners(): void {
    // Send message
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // AI Function buttons
    this.container.querySelector('#chatBtn')?.addEventListener('click', () => this.sendMessage('chat'));
    this.container.querySelector('#reportBtn2')?.addEventListener('click', () => {
      if (!this.messageInput.value.trim()) {
        this.messageInput.value = "Please create a learning report for me. I am a programmer who wants to improve my skills.";
      }
      this.sendMessage('report');
    });
    this.container.querySelector('#searchBtn')?.addEventListener('click', () => {
      if (!this.messageInput.value.trim()) {
        this.messageInput.value = "What are the best practices for software development?";
      }
      this.sendMessage('knowledge');
    });

    // Toolbar buttons
    this.container.querySelector('#newChatBtn')?.addEventListener('click', () => this.newChat());
    this.container.querySelector('#saveChatBtn')?.addEventListener('click', () => this.saveChat());
    this.container.querySelector('#reportBtn')?.addEventListener('click', () => {
      const reportPrompt = "Please create a learning report for me. I am a programmer who wants to improve my skills.";
      this.messageInput.value = reportPrompt;
      this.sendMessage('report');
    });
    this.container.querySelector('#questionsBtn')?.addEventListener('click', () => this.getInterviewQuestions());
    this.container.querySelector('#knowledgeBtn')?.addEventListener('click', () => {
      const knowledgePrompt = "What are the best practices for software development?";
      this.messageInput.value = knowledgePrompt;
      this.sendMessage('knowledge');
    });

    // Quick action buttons
    this.container.querySelector('#newChatAction')?.addEventListener('click', () => this.newChat());
    this.container.querySelector('#reportAction')?.addEventListener('click', () => {
      const reportPrompt = "Please create a learning report for me. I am a programmer who wants to improve my skills.";
      this.messageInput.value = reportPrompt;
      this.sendMessage('report');
    });
    this.container.querySelector('#questionsAction')?.addEventListener('click', () => this.getInterviewQuestions());
    this.container.querySelector('#knowledgeAction')?.addEventListener('click', () => {
      const knowledgePrompt = "What are the best practices for software development?";
      this.messageInput.value = knowledgePrompt;
      this.sendMessage('knowledge');
    });

    // Settings
    this.container.querySelector('#autoSave')?.addEventListener('change', (e) => {
      this.settings.autoSave = (e.target as HTMLInputElement).checked;
      this.saveSettings();
    });
    this.container.querySelector('#enableNotifications')?.addEventListener('change', (e) => {
      this.settings.enableNotifications = (e.target as HTMLInputElement).checked;
      this.saveSettings();
    });
    this.container.querySelector('#showTimestamps')?.addEventListener('change', (e) => {
      this.settings.showTimestamps = (e.target as HTMLInputElement).checked;
      this.saveSettings();
      this.refreshMessages();
    });

    // Auto-scroll toggle (double-click on chat display)
    this.chatDisplay.addEventListener('dblclick', () => {
      this.toggleAutoScroll();
    });

    // Window controls
    this.container.querySelector('#minimize')?.addEventListener('click', () => this.minimizeWindow());
    this.container.querySelector('#maximize')?.addEventListener('click', () => this.maximizeWindow());
    this.container.querySelector('#close')?.addEventListener('click', () => this.closeWindow());
  }

  private updateTime(): void {
    const timeElement = this.container.querySelector('#currentTime');
    if (timeElement) {
      timeElement.textContent = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  }

  private async sendMessage(type: 'chat' | 'report' | 'knowledge' = 'chat'): Promise<void> {
    const message = this.messageInput.value.trim();
    if (!message || this.isStreaming) return;

    // Add user message
    this.addMessage(createMessage('user', message));
    this.messageInput.value = '';
    this.isStreaming = true;
    this.updateSendButton(false);

    try {
      switch (type) {
        case 'chat':
          await this.handleStreamingChat(message);
          break;
        case 'report':
          await this.handleLearningReport(message);
          break;
        case 'knowledge':
          await this.handleKnowledgeBase(message);
          break;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage(createMessage('system', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error'));
    } finally {
      this.isStreaming = false;
      this.updateSendButton(true);
      this.updateMemoryStatus();
    }
  }

  private async handleStreamingChat(message: string): Promise<void> {
    let aiResponse = '';
    const aiMessage = createMessage('ai', '', 'chat');
    this.addMessage(aiMessage);

    try {
      for await (const chunk of aiApiClient.streamChat({ message, memoryId: 1 })) {
        console.debug('Received chunk:', JSON.stringify(chunk));
        aiResponse += chunk;
        this.updateMessage(aiMessage.id, aiResponse);
      }
    } catch (error) {
      console.error('Streaming error:', error);
      this.updateMessage(aiMessage.id, 'Error: Failed to get AI response');
    }
  }

  private async handleLearningReport(message: string): Promise<void> {
    try {
      const report = await aiApiClient.generateLearningReport({ message });
      const formattedReport = `Learning Report for: ${report.studentName}\n\n` +
        report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n');
      
      this.addMessage(createMessage('ai', formattedReport, 'report'));
    } catch (error) {
      console.error('Learning report error:', error);
      this.addMessage(createMessage('system', `Error generating learning report: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error'));
    }
  }

  private async handleKnowledgeBase(message: string): Promise<void> {
    try {
      const result = await aiApiClient.searchKnowledgeBase({ message });
      this.addMessage(createMessage('ai', result.content, 'knowledge'));
    } catch (error) {
      console.error('Knowledge base error:', error);
      this.addMessage(createMessage('system', `Error searching knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error'));
    }
  }

  private addMessage(message: ChatMessage): void {
    this.currentSession.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();
    if (this.settings.autoSave && message.sender !== 'system') {
      this.saveSession();
    }
  }

  private renderMessage(message: ChatMessage): void {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender}-message`;
    messageDiv.setAttribute('data-message-id', message.id);

    const timestampDisplay = this.settings.showTimestamps ? 
      `<span class="message-time">${formatTimestamp(message.timestamp)}</span>` : '';

    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="message-sender">${getSenderLabel(message.sender)}</span>
        ${timestampDisplay}
      </div>
      <div class="message-content">${this.formatMessageContent(message.content)}</div>
    `;

    this.chatDisplay.appendChild(messageDiv);
  }

  private updateMessage(messageId: string, content: string): void {
    const messageElement = this.chatDisplay.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      const contentElement = messageElement.querySelector('.message-content');
      if (contentElement) {
        contentElement.innerHTML = this.formatMessageContent(content);
        
        // Auto-scroll during streaming if user is near bottom
        this.autoScrollIfNearBottom();
      }
    }

    // Update in session data
    const message = this.currentSession.messages.find(m => m.id === messageId);
    if (message) {
      message.content = content;
    }
  }

  private formatMessageContent(content: string): string {
    // Enhanced formatting with code block support
    return content
      // Handle code blocks (```code```)
      .replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, language, code) => {
        const lang = language || 'text';
        const codeId = 'code_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const formattedCode = this.formatCodeContent(code);
        return `<div class="code-block">
          <div class="code-block-header">
            <span class="code-language">${lang}</span>
            <button class="copy-button" onclick="window.chatWindow.copyCode('${codeId}')" title="Copy code to clipboard">
              
              <span class="copy-text">COPY</span>
            </button>
          </div>
          <pre class="code-block-content"><code id="${codeId}">${this.escapeHtml(formattedCode)}</code></pre>
        </div>`;
      })
      // Handle inline code (`code`)
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // Handle bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Handle italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Handle newlines (after code blocks to avoid breaking them)
      .replace(/\n/g, '<br>');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private formatCodeContent(code: string): string {
    // Simple cleanup - preserve structure from backend
    return code
      .trim()
      // Normalize line endings only
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
  }

  public copyCode(codeId: string): void {
    const codeElement = document.getElementById(codeId);
    if (!codeElement) return;

    const codeText = codeElement.textContent || '';
    
    // Try to use the modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(codeText).then(() => {
        this.showCopyFeedback(codeId, true);
      }).catch(() => {
        // Fallback to the older method
        this.fallbackCopyText(codeText, codeId);
      });
    } else {
      // Fallback for older browsers or non-secure contexts
      this.fallbackCopyText(codeText, codeId);
    }
  }

  private fallbackCopyText(text: string, codeId: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      this.showCopyFeedback(codeId, successful);
    } catch (err) {
      console.error('Failed to copy code:', err);
      this.showCopyFeedback(codeId, false);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  private showCopyFeedback(codeId: string, success: boolean): void {
    const codeElement = document.getElementById(codeId);
    if (!codeElement) return;

    const codeBlock = codeElement.closest('.code-block');
    if (!codeBlock) return;

    const copyButton = codeBlock.querySelector('.copy-button');
    if (!copyButton) return;

    const copyText = copyButton.querySelector('.copy-text');
    if (!copyText) return;

    const originalText = copyText.textContent;
    const originalIcon = copyButton.querySelector('.copy-icon');
    const originalIconText = originalIcon ? originalIcon.textContent : '[]';
    
    if (success) {
      copyText.textContent = 'OK';
      if (originalIcon) originalIcon.textContent = '✓';
      copyButton.classList.add('copy-success');
    } else {
      copyText.textContent = 'ERR';
      if (originalIcon) originalIcon.textContent = '✗';
      copyButton.classList.add('copy-error');
    }

    setTimeout(() => {
      copyText.textContent = originalText;
      if (originalIcon) originalIcon.textContent = originalIconText;
      copyButton.classList.remove('copy-success', 'copy-error');
    }, 1500);
  }

  private scrollToBottom(): void {
    this.chatDisplay.scrollTop = this.chatDisplay.scrollHeight;
  }

  private scrollToBottomSmooth(): void {
    this.chatDisplay.scrollTo({
      top: this.chatDisplay.scrollHeight,
      behavior: 'smooth'
    });
  }

  private isNearBottom(): boolean {
    const threshold = 150; // pixels from bottom
    const scrollTop = this.chatDisplay.scrollTop;
    const scrollHeight = this.chatDisplay.scrollHeight;
    const clientHeight = this.chatDisplay.clientHeight;
    
    return (scrollHeight - scrollTop - clientHeight) <= threshold;
  }

  private autoScrollIfNearBottom(): void {
    // Only auto-scroll if enabled and user is already near the bottom
    // This prevents interrupting users who are reading earlier messages
    if (this.autoScrollEnabled && this.isNearBottom()) {
      // Throttle scrolling to prevent too frequent calls
      const now = Date.now();
      if (now - this.lastScrollTime > 100) { // Max once per 100ms
        this.scrollToBottomSmooth();
        this.lastScrollTime = now;
      }
    }
  }

  private toggleAutoScroll(): void {
    this.autoScrollEnabled = !this.autoScrollEnabled;
    const statusMessage = this.autoScrollEnabled ? 'Auto-scroll enabled' : 'Auto-scroll disabled';
    
    // Show brief status message
    this.showAutoScrollStatus(statusMessage);
  }

  private showAutoScrollStatus(message: string): void {
    // Create a temporary status indicator
    const statusDiv = document.createElement('div');
    statusDiv.className = 'auto-scroll-status';
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #c0c0c0;
      border: 2px outset #c0c0c0;
      padding: 4px 8px;
      font-size: 10px;
      font-family: "MS Sans Serif", sans-serif;
      z-index: 1000;
      pointer-events: none;
    `;
    
    this.chatDisplay.appendChild(statusDiv);
    
    // Remove after 2 seconds
    setTimeout(() => {
      if (statusDiv.parentNode) {
        statusDiv.parentNode.removeChild(statusDiv);
      }
    }, 2000);
  }

  private updateSendButton(enabled: boolean): void {
    this.sendButton.disabled = !enabled;
    this.sendButton.textContent = enabled ? 'Send' : 'Sending...';
  }

  private updateMemoryStatus(): void {
    const statusElement = this.container.querySelector('#memoryStatus');
    if (statusElement) {
      statusElement.textContent = `Memory: ${this.currentSession.messages.length}/10 messages`;
    }
  }

  private async testConnection(): Promise<void> {
    const statusElement = this.container.querySelector('#connectionStatus');
    if (!statusElement) return;

    try {
      const isConnected = await aiApiClient.testConnection();
      statusElement.textContent = isConnected ? 'Connected' : 'Disconnected';
      statusElement.className = isConnected ? 'status-section connected' : 'status-section disconnected';
    } catch (error) {
      statusElement.textContent = 'Connection Error';
      statusElement.className = 'status-section error';
    }
  }

  private newChat(): void {
    // Save current session if it has messages
    if (this.currentSession.messages.length > 1) { // > 1 to skip welcome message
      this.saveSession();
    }
    
    this.currentSession = this.createNewSession();
    this.chatDisplay.innerHTML = '';
    this.addMessage(createSystemWelcomeMessage());
    this.updateMemoryStatus();
    this.updateChatHistory();
  }

  private saveChat(): void {
    this.saveSession();
    this.addMessage(createMessage('system', 'Chat session saved successfully!'));
  }

  private async getInterviewQuestions(): Promise<void> {
    const questionsPrompt = "Please provide 5 common programming interview questions with brief explanations for each answer.";
    this.messageInput.value = questionsPrompt;
    await this.sendMessage('chat');
  }

  private saveSession(): void {
    // Update session title from first user message if still default
    if (this.currentSession.title === 'New Chat Session' && this.currentSession.messages.length > 0) {
      const firstUserMessage = this.currentSession.messages.find(m => m.sender === 'user');
      if (firstUserMessage) {
        this.currentSession.title = firstUserMessage.content.substring(0, 50) + 
          (firstUserMessage.content.length > 50 ? '...' : '');
      }
    }
    
    this.currentSession.lastActivity = new Date();
    localStorage.setItem(`session_${this.currentSession.id}`, JSON.stringify(this.currentSession));
    this.updateChatHistory();
  }

  private loadChatHistory(): void {
    const historyContainer = this.container.querySelector('#chatHistory');
    if (!historyContainer) return;

    // Get all saved sessions from localStorage
    const savedSessions: ChatSession[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('session_')) {
        try {
          const session = JSON.parse(localStorage.getItem(key)!);
          // Convert date strings back to Date objects
          session.lastActivity = new Date(session.lastActivity);
          session.messages.forEach((msg: ChatMessage) => {
            msg.timestamp = new Date(msg.timestamp);
          });
          savedSessions.push(session);
        } catch (error) {
          console.warn('Failed to load session:', key, error);
        }
      }
    }

    // Sort by last activity (newest first)
    savedSessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

    // Render chat history
    this.renderChatHistory(savedSessions);
  }

  private renderChatHistory(sessions: ChatSession[]): void {
    const historyContainer = this.container.querySelector('#chatHistory');
    if (!historyContainer) return;

    historyContainer.innerHTML = '';

    // Add current session
    const currentItem = document.createElement('div');
    currentItem.className = 'chat-history-item active';
    currentItem.innerHTML = `
      <div class="history-item-content">
        <div class="history-item-title">Current Session</div>
        <div class="history-item-date">Active now</div>
        <div class="history-item-count">${this.currentSession.messages.length} messages</div>
      </div>
    `;
    
    const currentContentArea = currentItem.querySelector('.history-item-content');
    currentContentArea?.addEventListener('click', () => {
      // Already current session, just scroll to top
      this.scrollToTop();
    });
    historyContainer.appendChild(currentItem);

    // Add saved sessions
    sessions.forEach(session => {
      if (session.id === this.currentSession.id) return; // Skip current session

      const item = document.createElement('div');
      item.className = 'chat-history-item';
      item.innerHTML = `
        <div class="history-item-content">
          <div class="history-item-title">${session.title}</div>
          <div class="history-item-date">${this.formatDate(session.lastActivity)}</div>
          <div class="history-item-count">${session.messages.length} messages</div>
        </div>
        <button class="history-delete-btn" title="Delete this chat session">×</button>
      `;
      
      // Add click handler for the main item (excluding delete button)
      const contentArea = item.querySelector('.history-item-content');
      contentArea?.addEventListener('click', (event) => this.loadSession(session, event.target as HTMLElement));
      
      // Add delete handler for the delete button
      const deleteBtn = item.querySelector('.history-delete-btn');
      deleteBtn?.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent triggering loadSession
        this.deleteChatSession(session);
      });
      
      historyContainer.appendChild(item);
    });

    // Add delete all button if there are saved sessions
    if (sessions.length > 0) {
      const clearButton = document.createElement('button');
      clearButton.className = 'history-clear-button';
      clearButton.textContent = 'Clear History';
      clearButton.addEventListener('click', () => this.clearChatHistory());
      historyContainer.appendChild(clearButton);
    }
  }

  private updateChatHistory(): void {
    this.loadChatHistory(); // Reload and re-render
  }

  private loadSession(session: ChatSession, clickedElement?: HTMLElement): void {
    // Save current session first if it has messages
    if (this.currentSession.messages.length > 1) { // > 1 to skip welcome message
      this.saveSession();
    }

    // Load the selected session
    this.currentSession = session;
    this.renderMessages();
    
    // Update active state in history
    this.container.querySelectorAll('.chat-history-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Mark the clicked item as active
    if (clickedElement) {
      const historyItem = clickedElement.closest('.chat-history-item');
      historyItem?.classList.add('active');
    }
    
    this.updateMemoryStatus();
    this.scrollToBottom();
  }

  private renderMessages(): void {
    this.chatDisplay.innerHTML = '';
    this.currentSession.messages.forEach(message => this.renderMessage(message));
  }

  private deleteChatSession(session: ChatSession): void {
    if (confirm(`Delete chat session "${session.title}"? This cannot be undone.`)) {
      // Remove the specific session from localStorage
      localStorage.removeItem(`session_${session.id}`);
      
      // If this was the current session, create a new one
      if (session.id === this.currentSession.id) {
        this.currentSession = this.createNewSession();
        this.chatDisplay.innerHTML = '';
        this.addMessage(createSystemWelcomeMessage());
        this.updateMemoryStatus();
      }
      
      // Refresh history display
      this.loadChatHistory();
      
      this.addMessage(createMessage('system', `Chat session "${session.title}" deleted successfully!`));
    }
  }

  private clearChatHistory(): void {
    if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      // Remove all session data from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('session_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Refresh history display
      this.loadChatHistory();
      
      this.addMessage(createMessage('system', 'Chat history cleared successfully!'));
    }
  }

  private formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  private scrollToTop(): void {
    this.chatDisplay.scrollTop = 0;
  }

  private saveSettings(): void {
    localStorage.setItem('ai-helper-settings', JSON.stringify(this.settings));
  }

  private refreshMessages(): void {
    this.chatDisplay.innerHTML = '';
    this.currentSession.messages.forEach(message => this.renderMessage(message));
  }

  private minimizeWindow(): void {
    const window = this.container.querySelector('.window') as HTMLElement;
    if (window) {
      window.style.display = 'none';
      this.addMessage(createMessage('system', 'Window minimized. Click taskbar to restore.'));
      // Simulate taskbar behavior - restore after 3 seconds
      setTimeout(() => {
        window.style.display = 'flex';
        this.addMessage(createMessage('system', 'Window restored.'));
      }, 3000);
    }
  }

  private maximizeWindow(): void {
    const window = this.container.querySelector('.window') as HTMLElement;
    if (window) {
      // Toggle between maximized and normal
      if (window.style.width === '100%') {
        window.style.width = '96%';
        window.style.height = '94%';
        window.style.top = '2%';
        window.style.left = '2%';
        this.addMessage(createMessage('system', 'Window restored to normal size.'));
      } else {
        window.style.width = '100%';
        window.style.height = '100%';
        window.style.top = '0';
        window.style.left = '0';
        this.addMessage(createMessage('system', 'Window maximized.'));
      }
    }
  }

  private closeWindow(): void {
    if (confirm('Are you sure you want to close AI Code Helper?')) {
      this.addMessage(createMessage('system', 'Thank you for using AI Code Helper! 👋'));
      setTimeout(() => {
        window.close();
      }, 1000);
    }
  }
}