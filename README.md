# GPT-Calories - Native ChatGPT App

An official ChatGPT Marketplace app that brings an interactive Health Ring UI directly into your chat experience. Track your nutrition naturally by talking to ChatGPT - just say what you ate!

## 🎯 Architecture Overview

This follows the official **ChatGPT Apps SDK** architecture:

```
┌─────────────┐
│   ChatGPT   │  ← The Brain (understanding & reasoning)
│  (Native)   │
└──────┬──────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐  ┌──────────────┐
│ MCP Server  │  │ Web Component│  ← The Face (UI rendering)
│ (Tools)     │  │ (Health Ring)│
└──────┬──────┘  └──────────────┘
       │
       ▼
┌─────────────┐
│  Supabase   │  ← The Memory (state storage)
│     KV      │
└─────────────┘
```

### Key Components

1. **MCP Endpoint** (`/api/mcp.ts`)
   - Public MCP endpoint for ChatGPT Apps: `https://YOUR-APP.vercel.app/mcp`
   - Proxies tool calls to Supabase Edge Functions with server-side auth headers
   - Exposes tools: `log_meal`, `sync_state`, `delete_meal`, `update_goals`

2. **Web Component** (`/public/component.html`)
   - Standalone HTML/JS component that renders the Health Ring
   - Listens to `window.openai` API for state updates from ChatGPT
   - Gets injected into the chat stream natively

3. **React Demo App** (`/src/app/App.tsx`)
   - Full-featured demo for testing outside ChatGPT
   - Shows what the experience will look like
   - Not needed for the ChatGPT integration

## 🚀 Deployment

### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Your app will be deployed to: `https://your-app.vercel.app`

### Step 2: Update manifest.json

Edit `/public/manifest.json` and replace the URLs:

```json
{
  "api": {
    "type": "mcp",
    "url": "https://YOUR-APP.vercel.app/mcp"
  },
  "ui_component": {
    "url": "https://YOUR-APP.vercel.app/component.html",
    "display_mode": "inline"
  }
}
```

### Step 3: Sideload into ChatGPT

1. Go to **ChatGPT** → **Settings** → **Apps**
2. Click **Create App** (or **Developer Mode**)
3. Enter your manifest URL: `https://YOUR-VERCEL-URL.vercel.app/manifest.json`
4. Test it out!

## 💬 How to Use in ChatGPT

Once installed, just talk naturally:

- **"I ate a chicken sandwich with 500 calories, 35g protein, 45g carbs, and 18g fats"**
- **"I had breakfast - scrambled eggs with toast, about 400 calories"**
- **"Show me my progress today"**
- **"Set my daily goal to 2200 calories"**

ChatGPT will:
1. Understand what you ate
2. Call the `log_meal` tool with the nutrition data
3. Inject the Health Ring UI showing your updated progress

## 🛠️ MCP Tools Available

### log_meal
Logs a meal with nutritional information.
```json
{
  "name": "Chicken Sandwich",
  "calories": 500,
  "protein": 35,
  "carbs": 45,
  "fats": 18
}
```

### sync_state
Gets current daily nutrition state.
```json
{}
```

### delete_meal
Removes a meal by ID.
```json
{
  "meal_id": "meal_12345"
}
```

### update_goals
Updates daily nutritional goals.
```json
{
  "calories": 2200,
  "protein": 150,
  "carbs": 220,
  "fats": 70
}
```

## 🎨 The Health Ring

The circular progress ring changes color based on your progress:
- **Emerald Green** (#10b981) - Under goal (healthy)
- **Red** (#ef4444) - Over goal

Includes mini rings for:
- **Protein** (Blue)
- **Carbs** (Orange)  
- **Fats** (Purple)

## 📝 Development

### Local Testing (Demo Mode)

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Visit `http://localhost:5173` to see the standalone React demo.

### Testing the Web Component

Open `/public/component.html` directly in a browser. It will fetch state from `/api/state` on the deployed app.

## 🔒 Security Notes

- CORS is wide open (`*`) for ChatGPT to access the component
- The MCP endpoint should validate requests from OpenAI in production
- User data is stored in Supabase KV store (key-value table)
- Daily states are keyed by date: `daily_state:YYYY-MM-DD`

## 📚 References

- [OpenAI ChatGPT Apps Docs](https://platform.openai.com/docs/chatgpt-apps)
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io/)
- [ChatGPT UI Component Library](https://platform.openai.com/docs/chatgpt-apps/ui-components)

## 🎯 The "Codex" Method

As shown in the OpenAI Build Hour, this was scaffolded using:
1. **ChatGPT Codex** (AI coding agent)
2. **OpenAI Docs MCP** (for ChatGPT Apps SDK knowledge)
3. **Supabase MCP** (for database scaffolding)

This is the modern way to build - let AI agents write the boilerplate! 🚀

---

Built with ❤️ following the official ChatGPT Apps architecture.
