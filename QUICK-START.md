# AI Code Helper - Quick Start Guide

## API Key Required

**The backend requires a Google AI Gemini API key to function.**

### Step 1: Get Your API Key

1. **Visit**: https://aistudio.google.com/app/apikey
2. **Sign up** for free Google account  
3. **Get your API key** (starts with `AIza...`)
4. **You get free credits** for testing!

### Step 2: Configure API Key and Start Application

**Simply run the management script:**
```bat
Double-click: ai-helper.bat
Choose option 9 (Setup API Keys)
Choose option 2 (permanent setup)
Then choose option 1 (Start Full Application)
```

**Alternative - Set Environment Variable Manually:**
```bat
setx GOOGLE_AI_GEMINI_API_KEY "your-actual-api-key-here"
```

**Test Mode (No Real AI):**
```bat
Double-click: ai-helper.bat
Choose option 9 (Setup API Keys)
Choose option 4 (test mode)
```

---

## What the Management Script Does:

### **ai-helper.bat** - All-in-One Management
- Interactive menu for all operations
- API key setup and management
- Start/stop services
- System status checking
- Frontend building and testing
- Shows startup progress with helpful messages

All functionality is now consolidated into the single ai-helper.bat script.

---

## 🔧 **Troubleshooting**

### **"Invalid API-key provided" Error**
```
Problem: Google AI Gemini API key not set or invalid
Solution: Run ai-helper.bat, choose option 9 and configure your key
```

### **"Port already in use" Error**  
```
Problem: Another service using port 8081 or 3000
Solution: Run ai-helper.bat, choose option S to stop, then start again
```

### **"Java not found" Error**
```
❌ Problem: Java 21+ not installed
✅ Solution: Install Java 21+ from https://adoptium.net/
```

### **"npm not found" Error**
```
❌ Problem: Node.js not installed  
✅ Solution: Install Node.js from https://nodejs.org/
```

---

## 🎯 **Ready to Start!**

1. **Double-click**: `ai-helper.bat`
2. **Choose option 9** to setup API keys (first time only)
3. **Choose option 1** to start the full application
3. **Wait** for services to start
4. **Use** your Windows 95 style AI Code Helper!

### **URLs After Startup:**
- **Frontend**: http://localhost:3000 (Windows 95 UI)
- **Backend**: http://localhost:8081/api (REST API)

---

**🎉 Enjoy your retro-styled AI programming assistant!**