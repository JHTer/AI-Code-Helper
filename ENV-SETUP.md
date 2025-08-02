 Environment Variables Setup

## .env File Configuration

The AI Code Helper now uses a `.env` file to store your API keys automatically. This eliminates the need to manually enter API keys each time you start the application.

### Quick Setup

1. **Edit the .env file** (already created for you):
   ```
   GOOGLE_AI_GEMINI_API_KEY=your-api-key-here
   BIGMODEL_API_KEY=your-bigmodel-api-key-here
   ```

2. **Replace the placeholder** with your actual Google AI Gemini API key:
   - Get your key from: https://aistudio.google.com/app/apikey
   - Replace `your-api-key-here` with your actual key (starts with `AIza...`)

3. **Start the application** using `ai-helper.bat` - no more API key prompts!

### Model Update

The application now uses **Gemini 2.0 Flash Experimental** model for better performance and capabilities.

### Using the Management Script

Run `ai-helper.bat` and:
- **Option 1**: Start Full Application - now automatically loads your API key
- **Option 9**: Setup API Keys → **Option 1**: Edit .env file (opens Notepad)

### Benefits

- **No repeated API key entry** - set once, use forever
- **Secure** - .env file stays local to your machine  
- **Easy editing** - simple text file format
- **Automatic loading** - batch script loads variables on startup
- **Flexible** - can still use other setup methods if needed

### File Structure

```
your-project/
├── .env                 # Your API keys (edit this)
├── ai-helper.bat        # Management script (runs this)
├── src/                 # Application source
└── ...
```

### Troubleshooting

**"Please replace the placeholder API key"**: 
- Edit `.env` file and replace `your-api-key-here` with your actual key

**"Environment variable is not set"**:
- Make sure `.env` file exists in the project root
- Check that the API key line doesn't start with `#` (comment)

**"Invalid API key"**:
- Verify your API key is correct at https://aistudio.google.com/app/apikey
- Make sure there are no extra spaces or quotes around the key