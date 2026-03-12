# 🚀 GPT-Calories Setup Guide

This guide walks you through deploying GPT-Calories as a native ChatGPT App.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- ChatGPT Plus subscription (for Apps access)
- Supabase project (already configured in this Make environment)

## Step-by-Step Setup

### 1️⃣ Push to GitHub

```bash
# Initialize git if not already
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - GPT-Calories ChatGPT App"

# Add your GitHub repo as remote
git remote add origin https://github.com/YOUR-USERNAME/gpt-calories.git

# Push
git push -u origin main
```

### 2️⃣ Deploy to Vercel

**Option A: Via Vercel Dashboard (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect the configuration
5. Click **Deploy**

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

You'll get a URL like: `https://gpt-calories.vercel.app`

### 3️⃣ Configure Environment Variables

Your Supabase backend is already running in this Make environment, but ChatGPT should call your Vercel proxy URLs:

- **MCP Endpoint**: `https://YOUR-VERCEL-URL.vercel.app/mcp`
- **REST API**: `https://YOUR-VERCEL-URL.vercel.app/api/state`

Set these in Vercel Environment Variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 4️⃣ Update manifest.json

Edit `/public/manifest.json` with your actual URLs:

```json
{
  "schema_version": "v1",
  "name": "GPT-Calories",
  "description": "Track your nutrition with an interactive Health Ring",
  "icon": "https://YOUR-VERCEL-URL.vercel.app/icon.png",
  "api": {
    "type": "mcp",
    "url": "https://YOUR-VERCEL-URL.vercel.app/mcp"
  },
  "ui_component": {
    "url": "https://YOUR-VERCEL-URL.vercel.app/component.html",
    "display_mode": "inline"
  }
}
```

Commit and push this change:

```bash
git add public/manifest.json
git commit -m "Update manifest with production URLs"
git push
```

Vercel will automatically redeploy.

### 5️⃣ Create App Icon (Optional)

Create a 512x512 PNG icon and place it in `/public/icon.png`. This will be your app's logo in the ChatGPT marketplace.

### 6️⃣ Test the Web Component

Before integrating with ChatGPT, test your component:

1. Visit: `https://YOUR-VERCEL-URL.vercel.app/component.html`
2. You should see the Health Ring with "No meals logged yet"
3. Check browser console for any errors

### 7️⃣ Sideload into ChatGPT

**For ChatGPT Plus Users:**

1. Open [chat.openai.com](https://chat.openai.com)
2. Go to **Settings** → **Apps** (or look for developer/beta features)
3. Click **"Create App"** or **"Install from URL"**
4. Enter your manifest URL: `https://YOUR-VERCEL-URL.vercel.app/manifest.json`
5. Click **Install**

**Note**: As of March 2026, ChatGPT Apps are in beta. If you don't see the Apps section:
- Ensure you have ChatGPT Plus
- Check for any beta program signups on OpenAI's platform
- The feature might be rolling out gradually

### 8️⃣ Test It Out!

Once installed, start a new chat and say:

```
"I had a chicken sandwich for lunch with 500 calories, 35g protein, 45g carbs, and 18g fats"
```

ChatGPT should:
1. Understand your meal
2. Call the `log_meal` tool
3. Display the Health Ring UI inline in the chat
4. Show your updated calorie progress!

Try these commands:
- **"Show my nutrition progress"** → Triggers `sync_state`
- **"I ate an apple, about 95 calories"** → Logs simple meals
- **"Set my daily goal to 2200 calories"** → Updates goals
- **"What did I eat today?"** → ChatGPT reads from the state

## 🎨 Customization

### Change Colors

Edit `/public/component.html` and modify the color constants:

```javascript
const mainColor = calorieProgress <= 100 ? '#10b981' : '#ef4444';
```

### Adjust Default Goals

Edit `/supabase/functions/server/mcp_handler.tsx`:

```typescript
goals: {
  calories: 2000,  // Change this
  protein: 150,    // And this
  carbs: 200,      // And this
  fats: 65,        // And this
}
```

### Change Display Mode

In `manifest.json`, change `display_mode`:
- `"inline"` - Shows in the chat stream
- `"fullscreen"` - Opens in a modal/overlay
- `"sidebar"` - Shows in a side panel

## 🐛 Troubleshooting

### "Component not loading"

- Check CORS headers in `vercel.json`
- Verify the component URL is accessible
- Check browser console for errors

### "Tools not working"

- Verify MCP endpoint is responding: `curl https://YOUR-VERCEL-URL.vercel.app/mcp`
- Check Supabase function logs
- Ensure ChatGPT can reach your endpoint (no VPN/firewall blocking)

### "State not persisting"

- Check that the Supabase KV store is working
- Verify the `daily_state:YYYY-MM-DD` keys are being created
- Look at server logs in Supabase dashboard

### "ChatGPT doesn't understand my meal"

ChatGPT's understanding is pretty robust, but help it by including:
- Food name
- Calorie amount
- Optionally: protein, carbs, fats in grams

Good: "I had oatmeal with 300 calories, 10g protein, 50g carbs, 5g fats"
Bad: "breakfast" (too vague)

## 📊 Monitoring

### Vercel Analytics

Enable Vercel Analytics to see:
- How many times your component is loaded
- Performance metrics
- Error rates

### Supabase Logs

View your MCP server logs:
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions**
3. Select `make-server-ae24ed01`
4. View **Logs** tab

## 🚀 Going to Production

### For ChatGPT Marketplace

To publish to the official ChatGPT App Marketplace:

1. Polish your app (icons, descriptions)
2. Add proper error handling
3. Consider rate limiting
4. Write user documentation
5. Submit to OpenAI for review

Check [OpenAI's submission guidelines](https://platform.openai.com/docs/chatgpt-apps/publishing).

### Security Hardening

For production:

1. **Validate requests** - Ensure MCP calls are coming from OpenAI
   ```typescript
   // Add to MCP handler
   const apiKey = c.req.header('Authorization');
   if (!isValidOpenAIRequest(apiKey)) {
     return c.json({ error: 'Unauthorized' }, 401);
   }
   ```

2. **Rate limiting** - Prevent abuse
   ```typescript
   // Use rate limiting middleware
   app.use('/mcp', rateLimiter({ max: 100 }));
   ```

3. **Input validation** - Sanitize all inputs
   ```typescript
   if (calories < 0 || calories > 10000) {
     return { error: 'Invalid calorie amount' };
   }
   ```

## 🎓 Next Steps

- **Add more features**: Exercise tracking, water intake, weight logs
- **Improve UI**: Animations, charts, historical data
- **Social features**: Share progress, challenges with friends
- **AI insights**: Let ChatGPT analyze your eating patterns

---

Need help? Check the [full documentation](README.md) or open an issue on GitHub!
