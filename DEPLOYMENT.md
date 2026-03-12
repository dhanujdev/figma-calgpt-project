# 🚀 GPT-Calories Deployment Guide

## Quick Deploy to Production

### Step 1: Deploy to Vercel

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: GPT-Calories ChatGPT App"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Set Environment Variables in Vercel:**
   - In your Vercel project settings, go to "Environment Variables"
   - Add these variables:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Copy your production URL (e.g., `https://your-app.vercel.app`)

### Step 2: Update Manifest URLs

After deployment, update `/public/manifest.json`:

```json
{
  "icon": "https://your-app.vercel.app/icon.svg",
  "api": {
    "type": "mcp",
    "url": "https://your-app.vercel.app/mcp"
  },
  "ui_component": {
    "url": "https://your-app.vercel.app/component.html",
    "display_mode": "inline"
  }
}
```

### Step 3: Register in ChatGPT

1. **Go to ChatGPT:**
   - Navigate to ChatGPT Settings
   - Go to "Apps" section
   - Click "Create App"

2. **Provide Manifest URL:**
   - Enter: `https://your-app.vercel.app/manifest.json`
   - ChatGPT will validate and load your app

3. **Test:**
   - Start a new chat
   - Say: "I ate a chicken sandwich with 700 calories, 35g protein, 50g carbs, 30g fats"
   - The Health Ring should appear inline!

## Architecture Overview

### The Flow

```
User in ChatGPT
    ↓
"I ate a burger"
    ↓
ChatGPT (GPT-4) → Understands intent
    ↓
Calls MCP Tool: log_meal
    ↓
Vercel /mcp endpoint
    ↓
Supabase Edge Function
    ↓
Stores in KV Store
    ↓
Returns updated state to ChatGPT
    ↓
ChatGPT injects component.html
    ↓
window.openai API updates the UI
    ↓
Health Ring updates in real-time! 🎉
```

### File Structure

```
/public
  ├── manifest.json        # ChatGPT App manifest
  ├── component.html       # Web component (Health Ring UI)
  └── icon.svg            # App icon

/api
  ├── mcp.ts              # MCP endpoint proxy for ChatGPT
  └── state.ts            # State endpoint for component fallback

/supabase/functions/server
  ├── index.tsx           # Hono server (internal backend)
  ├── mcp_handler.tsx     # MCP tool implementations
  └── kv_store.tsx        # Supabase KV storage wrapper

/src/app
  ├── App.tsx             # Standalone demo (for testing)
  ├── components/
      ├── HealthRing.tsx  # React version of Health Ring
      └── MealLog.tsx     # Meal list component
```

## Environment Variables

Required in Vercel:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public anonymous key

Only required in Supabase Edge Function runtime (not Vercel):
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side admin key

## Testing

### Test Locally (Standalone React App)
```bash
npm run dev
```
Visit `http://localhost:5173` to test the Health Ring independently.

### Test the Web Component
Open `/public/component.html` in your browser to test the ChatGPT UI component.

### Test MCP Endpoints
```bash
# Verify MCP initialize
curl -X POST https://YOUR_APP.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'

# List tools
curl -X POST https://YOUR_APP.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

# Get state via proxy
curl https://YOUR_APP.vercel.app/api/state
```

## Troubleshooting

### Health Ring not appearing in ChatGPT
- Check that `component.html` is accessible at your Vercel URL
- Verify CORS headers are set in `vercel.json`
- Check browser console for errors

### MCP tools not being called
- Verify the manifest.json `api.url` points to your Vercel `/mcp` endpoint
- Check Supabase function logs for errors
- Ensure environment variables are set

### Data not persisting
- Check Supabase connection
- Verify KV store is working: `await kv.get('test')`
- Check server logs for storage errors

## Next Steps

- **Add AI Parsing:** Integrate OpenAI API to parse natural language meal descriptions
- **Add Photos:** Use GPT-4 Vision to analyze food photos and estimate calories
- **Historical Data:** Show weekly/monthly trends
- **Sync with Apple Health:** Import data from health tracking apps
- **Social Features:** Share progress with friends

## Resources

- [OpenAI ChatGPT Apps SDK](https://platform.openai.com/docs/chatgpt-apps)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Vercel Deployment](https://vercel.com/docs)
