(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();class g{baseUrl;abortController;constructor(e="/api"){this.baseUrl=e}async chat(e){const t=await fetch(`${this.baseUrl}/ai/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e.message)});if(!t.ok)throw new Error(`Chat API error: ${t.statusText}`);return t.text()}async*streamChat(e){this.abortController=new AbortController;const t=new URLSearchParams({message:e.message,memoryId:(e.memoryId||1).toString()}),s=await fetch(`${this.baseUrl}/ai/chat/stream?${t}`,{method:"GET",headers:{Accept:"text/event-stream","Cache-Control":"no-cache"},signal:this.abortController.signal});if(!s.ok)throw new Error(`Stream API error: ${s.statusText}`);const n=s.body?.getReader();if(!n)throw new Error("Failed to get response reader");const i=new TextDecoder;let o="";try{for(;;){const{done:d,value:c}=await n.read();if(d)break;o+=i.decode(c,{stream:!0});const l=o.split(`
`);o=l.pop()||"";for(const p of l)if(p.startsWith("data:")){const h=p.slice(5);if(h==="[DONE]")return;h&&h!=="null"&&h!==""&&(yield h.replace(/\\n/g,`
`))}}}finally{n.releaseLock()}}async generateLearningReport(e){const t=await fetch(`${this.baseUrl}/ai/learning-report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e.message})});if(!t.ok)throw new Error(`Learning Report API error: ${t.statusText}`);const s=await t.json();return{studentName:s.studentName||"Student",recommendations:s.recommendations||[s.error||"No recommendations available"]}}async searchKnowledgeBase(e){const t=await fetch(`${this.baseUrl}/ai/chat/knowledge`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e.message})});if(!t.ok)throw new Error(`Knowledge Base API error: ${t.statusText}`);const s=await t.json();return{content:s.content||s.error||"No response",sources:s.sources||[]}}async healthCheck(){const e=await fetch(`${this.baseUrl}/ai/health`,{method:"GET"});if(!e.ok)throw new Error(`Health check failed: ${e.statusText}`);return e.text()}cancelStream(){this.abortController&&(this.abortController.abort(),this.abortController=void 0)}async testConnection(){try{return await this.healthCheck(),!0}catch(e){return console.error("Connection test failed:",e),!1}}}const u=new g;function a(r,e,t="chat"){return{id:y(),sender:r,content:e,timestamp:new Date,type:t}}function y(){return`msg_${Date.now()}_${Math.random().toString(36).substr(2,9)}`}function v(r){return r.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0})}function f(r){switch(r){case"user":return"[USER] You";case"ai":return"[AI] Assistant";case"system":return"[SYSTEM] Info";default:return"[UNKNOWN]"}}function m(){return a("system","Welcome to AI Code Helper! I'm your programming assistant specialized in helping with learning, career guidance, and interview preparation. How can I help you today?","chat")}class b{container;chatDisplay;messageInput;sendButton;currentSession;settings;isStreaming=!1;constructor(e){this.container=e,this.currentSession=this.createNewSession(),this.settings=this.loadSettings(),this.init()}init(){this.render(),this.attachEventListeners(),this.addMessage(m()),this.loadChatHistory(),this.testConnection()}createNewSession(){return{id:`session_${Date.now()}`,title:"New Chat Session",messages:[],lastActivity:new Date,type:"general"}}loadSettings(){const e=localStorage.getItem("ai-helper-settings");return e?JSON.parse(e):{autoSave:!0,enableNotifications:!1,showTimestamps:!0,theme:"windows95"}}render(){this.container.innerHTML=`
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
                    <input type="checkbox" id="autoSave" ${this.settings.autoSave?"checked":""}> 
                    Auto-save conversations
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" id="enableNotifications" ${this.settings.enableNotifications?"checked":""}> 
                    Enable notifications
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" id="showTimestamps" ${this.settings.showTimestamps?"checked":""}> 
                    Show timestamps
                  </label>
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
    `,this.chatDisplay=this.container.querySelector("#chatDisplay"),this.messageInput=this.container.querySelector("#messageInput"),this.sendButton=this.container.querySelector("#sendBtn"),this.updateTime(),setInterval(()=>this.updateTime(),1e3)}attachEventListeners(){this.sendButton.addEventListener("click",()=>this.sendMessage()),this.messageInput.addEventListener("keydown",e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),this.sendMessage())}),this.container.querySelector("#chatBtn")?.addEventListener("click",()=>this.sendMessage("chat")),this.container.querySelector("#reportBtn2")?.addEventListener("click",()=>{this.messageInput.value.trim()||(this.messageInput.value="Please create a learning report for me. I am a programmer who wants to improve my skills."),this.sendMessage("report")}),this.container.querySelector("#searchBtn")?.addEventListener("click",()=>{this.messageInput.value.trim()||(this.messageInput.value="What are the best practices for software development?"),this.sendMessage("knowledge")}),this.container.querySelector("#newChatBtn")?.addEventListener("click",()=>this.newChat()),this.container.querySelector("#saveChatBtn")?.addEventListener("click",()=>this.saveChat()),this.container.querySelector("#reportBtn")?.addEventListener("click",()=>{const e="Please create a learning report for me. I am a programmer who wants to improve my skills.";this.messageInput.value=e,this.sendMessage("report")}),this.container.querySelector("#questionsBtn")?.addEventListener("click",()=>this.getInterviewQuestions()),this.container.querySelector("#knowledgeBtn")?.addEventListener("click",()=>{const e="What are the best practices for software development?";this.messageInput.value=e,this.sendMessage("knowledge")}),this.container.querySelector("#newChatAction")?.addEventListener("click",()=>this.newChat()),this.container.querySelector("#reportAction")?.addEventListener("click",()=>{const e="Please create a learning report for me. I am a programmer who wants to improve my skills.";this.messageInput.value=e,this.sendMessage("report")}),this.container.querySelector("#questionsAction")?.addEventListener("click",()=>this.getInterviewQuestions()),this.container.querySelector("#knowledgeAction")?.addEventListener("click",()=>{const e="What are the best practices for software development?";this.messageInput.value=e,this.sendMessage("knowledge")}),this.container.querySelector("#autoSave")?.addEventListener("change",e=>{this.settings.autoSave=e.target.checked,this.saveSettings()}),this.container.querySelector("#enableNotifications")?.addEventListener("change",e=>{this.settings.enableNotifications=e.target.checked,this.saveSettings()}),this.container.querySelector("#showTimestamps")?.addEventListener("change",e=>{this.settings.showTimestamps=e.target.checked,this.saveSettings(),this.refreshMessages()}),this.container.querySelector("#minimize")?.addEventListener("click",()=>this.minimizeWindow()),this.container.querySelector("#maximize")?.addEventListener("click",()=>this.maximizeWindow()),this.container.querySelector("#close")?.addEventListener("click",()=>this.closeWindow())}updateTime(){const e=this.container.querySelector("#currentTime");e&&(e.textContent=new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0}))}async sendMessage(e="chat"){const t=this.messageInput.value.trim();if(!(!t||this.isStreaming)){this.addMessage(a("user",t)),this.messageInput.value="",this.isStreaming=!0,this.updateSendButton(!1);try{switch(e){case"chat":await this.handleStreamingChat(t);break;case"report":await this.handleLearningReport(t);break;case"knowledge":await this.handleKnowledgeBase(t);break}}catch(s){console.error("Error sending message:",s),this.addMessage(a("system",`Error: ${s instanceof Error?s.message:"Unknown error"}`,"error"))}finally{this.isStreaming=!1,this.updateSendButton(!0),this.updateMemoryStatus()}}}async handleStreamingChat(e){let t="";const s=a("ai","","chat");this.addMessage(s);try{for await(const n of u.streamChat({message:e,memoryId:1}))console.debug("Received chunk:",JSON.stringify(n)),t+=n,this.updateMessage(s.id,t)}catch(n){console.error("Streaming error:",n),this.updateMessage(s.id,"Error: Failed to get AI response")}}async handleLearningReport(e){try{const t=await u.generateLearningReport({message:e}),s=`Learning Report for: ${t.studentName}

`+t.recommendations.map((n,i)=>`${i+1}. ${n}`).join(`
`);this.addMessage(a("ai",s,"report"))}catch(t){console.error("Learning report error:",t),this.addMessage(a("system",`Error generating learning report: ${t instanceof Error?t.message:"Unknown error"}`,"error"))}}async handleKnowledgeBase(e){try{const t=await u.searchKnowledgeBase({message:e});this.addMessage(a("ai",t.content,"knowledge"))}catch(t){console.error("Knowledge base error:",t),this.addMessage(a("system",`Error searching knowledge base: ${t instanceof Error?t.message:"Unknown error"}`,"error"))}}addMessage(e){this.currentSession.messages.push(e),this.renderMessage(e),this.scrollToBottom(),this.settings.autoSave&&e.sender!=="system"&&this.saveSession()}renderMessage(e){const t=document.createElement("div");t.className=`message ${e.sender}-message`,t.setAttribute("data-message-id",e.id);const s=this.settings.showTimestamps?`<span class="message-time">${v(e.timestamp)}</span>`:"";t.innerHTML=`
      <div class="message-header">
        <span class="message-sender">${f(e.sender)}</span>
        ${s}
      </div>
      <div class="message-content">${this.formatMessageContent(e.content)}</div>
    `,this.chatDisplay.appendChild(t)}updateMessage(e,t){const s=this.chatDisplay.querySelector(`[data-message-id="${e}"]`);if(s){const i=s.querySelector(".message-content");i&&(i.innerHTML=this.formatMessageContent(t))}const n=this.currentSession.messages.find(i=>i.id===e);n&&(n.content=t)}formatMessageContent(e){return e.replace(/```(\w+)?\n?([\s\S]*?)```/g,(t,s,n)=>{const i=s||"text",o="code_"+Date.now()+"_"+Math.random().toString(36).substr(2,9),d=this.formatCodeContent(n);return`<div class="code-block">
          <div class="code-block-header">
            <span class="code-language">${i}</span>
            <button class="copy-button" onclick="window.chatWindow.copyCode('${o}')" title="Copy code to clipboard">
              <span class="copy-icon">[]</span>
              <span class="copy-text">COPY</span>
            </button>
          </div>
          <pre class="code-block-content"><code id="${o}">${this.escapeHtml(d)}</code></pre>
        </div>`}).replace(/`([^`]+)`/g,'<code class="inline-code">$1</code>').replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\*(.*?)\*/g,"<em>$1</em>").replace(/\n/g,"<br>")}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}formatCodeContent(e){return e.trim().replace(/\r\n/g,`
`).replace(/\r/g,`
`)}copyCode(e){const t=document.getElementById(e);if(!t)return;const s=t.textContent||"";navigator.clipboard&&window.isSecureContext?navigator.clipboard.writeText(s).then(()=>{this.showCopyFeedback(e,!0)}).catch(()=>{this.fallbackCopyText(s,e)}):this.fallbackCopyText(s,e)}fallbackCopyText(e,t){const s=document.createElement("textarea");s.value=e,s.style.position="fixed",s.style.left="-999999px",s.style.top="-999999px",document.body.appendChild(s),s.focus(),s.select();try{const n=document.execCommand("copy");this.showCopyFeedback(t,n)}catch(n){console.error("Failed to copy code:",n),this.showCopyFeedback(t,!1)}finally{document.body.removeChild(s)}}showCopyFeedback(e,t){const s=document.getElementById(e);if(!s)return;const n=s.closest(".code-block");if(!n)return;const i=n.querySelector(".copy-button");if(!i)return;const o=i.querySelector(".copy-text");if(!o)return;const d=o.textContent,c=i.querySelector(".copy-icon"),l=c?c.textContent:"[]";t?(o.textContent="OK",c&&(c.textContent="✓"),i.classList.add("copy-success")):(o.textContent="ERR",c&&(c.textContent="✗"),i.classList.add("copy-error")),setTimeout(()=>{o.textContent=d,c&&(c.textContent=l),i.classList.remove("copy-success","copy-error")},1500)}scrollToBottom(){this.chatDisplay.scrollTop=this.chatDisplay.scrollHeight}updateSendButton(e){this.sendButton.disabled=!e,this.sendButton.textContent=e?"Send":"Sending..."}updateMemoryStatus(){const e=this.container.querySelector("#memoryStatus");e&&(e.textContent=`Memory: ${this.currentSession.messages.length}/10 messages`)}async testConnection(){const e=this.container.querySelector("#connectionStatus");if(e)try{const t=await u.testConnection();e.textContent=t?"Connected":"Disconnected",e.className=t?"status-section connected":"status-section disconnected"}catch{e.textContent="Connection Error",e.className="status-section error"}}newChat(){this.currentSession.messages.length>1&&this.saveSession(),this.currentSession=this.createNewSession(),this.chatDisplay.innerHTML="",this.addMessage(m()),this.updateMemoryStatus(),this.updateChatHistory()}saveChat(){this.saveSession(),this.addMessage(a("system","Chat session saved successfully!"))}async getInterviewQuestions(){const e="Please provide 5 common programming interview questions with brief explanations for each answer.";this.messageInput.value=e,await this.sendMessage("chat")}saveSession(){if(this.currentSession.title==="New Chat Session"&&this.currentSession.messages.length>0){const e=this.currentSession.messages.find(t=>t.sender==="user");e&&(this.currentSession.title=e.content.substring(0,50)+(e.content.length>50?"...":""))}this.currentSession.lastActivity=new Date,localStorage.setItem(`session_${this.currentSession.id}`,JSON.stringify(this.currentSession)),this.updateChatHistory()}loadChatHistory(){if(!this.container.querySelector("#chatHistory"))return;const t=[];for(let s=0;s<localStorage.length;s++){const n=localStorage.key(s);if(n?.startsWith("session_"))try{const i=JSON.parse(localStorage.getItem(n));i.lastActivity=new Date(i.lastActivity),i.messages.forEach(o=>{o.timestamp=new Date(o.timestamp)}),t.push(i)}catch(i){console.warn("Failed to load session:",n,i)}}t.sort((s,n)=>n.lastActivity.getTime()-s.lastActivity.getTime()),this.renderChatHistory(t)}renderChatHistory(e){const t=this.container.querySelector("#chatHistory");if(!t)return;t.innerHTML="";const s=document.createElement("div");if(s.className="chat-history-item active",s.innerHTML=`
      <div class="history-item-content">
        <div class="history-item-title">Current Session</div>
        <div class="history-item-date">Active now</div>
        <div class="history-item-count">${this.currentSession.messages.length} messages</div>
      </div>
    `,s.querySelector(".history-item-content")?.addEventListener("click",()=>{this.scrollToTop()}),t.appendChild(s),e.forEach(i=>{if(i.id===this.currentSession.id)return;const o=document.createElement("div");o.className="chat-history-item",o.innerHTML=`
        <div class="history-item-content">
          <div class="history-item-title">${i.title}</div>
          <div class="history-item-date">${this.formatDate(i.lastActivity)}</div>
          <div class="history-item-count">${i.messages.length} messages</div>
        </div>
        <button class="history-delete-btn" title="Delete this chat session">×</button>
      `,o.querySelector(".history-item-content")?.addEventListener("click",l=>this.loadSession(i,l.target)),o.querySelector(".history-delete-btn")?.addEventListener("click",l=>{l.stopPropagation(),this.deleteChatSession(i)}),t.appendChild(o)}),e.length>0){const i=document.createElement("button");i.className="history-clear-button",i.textContent="Clear History",i.addEventListener("click",()=>this.clearChatHistory()),t.appendChild(i)}}updateChatHistory(){this.loadChatHistory()}loadSession(e,t){this.currentSession.messages.length>1&&this.saveSession(),this.currentSession=e,this.renderMessages(),this.container.querySelectorAll(".chat-history-item").forEach(s=>{s.classList.remove("active")}),t&&t.closest(".chat-history-item")?.classList.add("active"),this.updateMemoryStatus(),this.scrollToBottom()}renderMessages(){this.chatDisplay.innerHTML="",this.currentSession.messages.forEach(e=>this.renderMessage(e))}deleteChatSession(e){confirm(`Delete chat session "${e.title}"? This cannot be undone.`)&&(localStorage.removeItem(`session_${e.id}`),e.id===this.currentSession.id&&(this.currentSession=this.createNewSession(),this.chatDisplay.innerHTML="",this.addMessage(m()),this.updateMemoryStatus()),this.loadChatHistory(),this.addMessage(a("system",`Chat session "${e.title}" deleted successfully!`)))}clearChatHistory(){if(confirm("Are you sure you want to clear all chat history? This cannot be undone.")){const e=[];for(let t=0;t<localStorage.length;t++){const s=localStorage.key(t);s?.startsWith("session_")&&e.push(s)}e.forEach(t=>localStorage.removeItem(t)),this.loadChatHistory(),this.addMessage(a("system","Chat history cleared successfully!"))}}formatDate(e){const s=new Date().getTime()-e.getTime(),n=Math.floor(s/(1e3*60*60*24));return n===0?e.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0}):n===1?"Yesterday":n<7?`${n} days ago`:e.toLocaleDateString("en-US",{month:"short",day:"numeric"})}scrollToTop(){this.chatDisplay.scrollTop=0}saveSettings(){localStorage.setItem("ai-helper-settings",JSON.stringify(this.settings))}refreshMessages(){this.chatDisplay.innerHTML="",this.currentSession.messages.forEach(e=>this.renderMessage(e))}minimizeWindow(){const e=this.container.querySelector(".window");e&&(e.style.display="none",this.addMessage(a("system","Window minimized. Click taskbar to restore.")),setTimeout(()=>{e.style.display="flex",this.addMessage(a("system","Window restored."))},3e3))}maximizeWindow(){const e=this.container.querySelector(".window");e&&(e.style.width==="100%"?(e.style.width="96%",e.style.height="94%",e.style.top="2%",e.style.left="2%",this.addMessage(a("system","Window restored to normal size."))):(e.style.width="100%",e.style.height="100%",e.style.top="0",e.style.left="0",this.addMessage(a("system","Window maximized."))))}closeWindow(){confirm("Are you sure you want to close AI Code Helper?")&&(this.addMessage(a("system","Thank you for using AI Code Helper! 👋")),setTimeout(()=>{window.close()},1e3))}}document.addEventListener("DOMContentLoaded",()=>{const r=document.getElementById("app");if(!r){console.error("App container not found!");return}try{const e=new b(r);window.chatWindow=e,console.log("AI Code Helper initialized successfully"),window.addEventListener("error",t=>{console.error("Global error:",t.error)}),window.addEventListener("unhandledrejection",t=>{console.error("Unhandled promise rejection:",t.reason)})}catch(e){console.error("Failed to initialize AI Code Helper:",e),r.innerHTML=`
      <div style="padding: 20px; color: red; font-family: 'MS Sans Serif', sans-serif;">
        <h3>Error: Failed to load AI Code Helper</h3>
        <p>Please refresh the page or check the console for more details.</p>
        <pre>${e instanceof Error?e.message:String(e)}</pre>
      </div>
    `}});
//# sourceMappingURL=index-DYiZOYHO.js.map
