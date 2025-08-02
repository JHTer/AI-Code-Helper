// AI Code Helper - Main TypeScript Entry Point

import './styles/win95-style.css';
import './styles/win95-icons.css';
import { ChatWindow } from './components/ChatWindow';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  
  if (!appContainer) {
    console.error('App container not found!');
    return;
  }

  // Create and initialize the chat window
  try {
    const chatWindow = new ChatWindow(appContainer);
    
    // Make chatWindow available globally for copy functionality
    (window as any).chatWindow = chatWindow;
    
    console.log('AI Code Helper initialized successfully');
    
    // Global error handling
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });

  } catch (error) {
    console.error('Failed to initialize AI Code Helper:', error);
    appContainer.innerHTML = `
      <div style="padding: 20px; color: red; font-family: 'MS Sans Serif', sans-serif;">
        <h3>Error: Failed to load AI Code Helper</h3>
        <p>Please refresh the page or check the console for more details.</p>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
});

// Hot module replacement for development
if ((import.meta as any).hot) {
  (import.meta as any).hot.accept();
}