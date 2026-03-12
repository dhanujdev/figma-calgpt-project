# ⚡ Quick Start Guide - GPT-Calories

Get GPT-Calories running in ChatGPT in under 10 minutes!

---

## 🎯 What You're Building

A native ChatGPT app that lets users track nutrition by just talking. Say "I ate a burger" and watch a beautiful Health Ring update inline in the chat!

---

## ✅ Prerequisites (2 minutes)

- [ ] GitHub account
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] ChatGPT Plus subscription
- [ ] This codebase ready to deploy

---

## 🚀 Deployment (5 minutes)

### Step 1: Push to GitHub

```bash
# In your project directory
git init
git add .
git commit -m "GPT-Calories initial commit"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/gpt-calories.git
git push -u origin main
```

### Step 2: Deploy to Vercel

**Via Vercel Dashboard:**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your `gpt-calories` repo
4. Click **Deploy** (accept all defaults)
5. Wait ~2 minutes for deployment

You'll get a URL like: `https://gpt-calories-xyz.vercel.app`

### Step 3: Get Your Supabase URL

Your backend is already running! Find your Supabase project ID:

1. Look in `/utils/supabase/info.tsx` in this project
2. Or check your Figma Make project settings

Your MCP endpoint is:
```
https://[PROJECT-ID].supabase.co/functions/v1/make-server-ae24ed01/mcp
```

### Step 4: Update manifest.json

Edit `/public/manifest.json`:

```json
{
  "api": {
    "type": "mcp",
    "url": "https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-ae24ed01/mcp"
  },
  "ui_component": {
    "url": "https://YOUR-VERCEL-URL.vercel.app/component.html",
    "display_mode": "inline"
  }
}
```

Commit and push:
```bash
git add public/manifest.json
git commit -m "Update production URLs"
git push
```

Vercel auto-deploys in ~1 minute.

---

## 🧪 Testing (2 minutes)

### Test the Web Component

Visit: `https://YOUR-VERCEL-URL.vercel.app/component.html`

You should see:
- A circular Health Ring (empty)
- "No meals logged yet"
- No JavaScript errors in console

### Test the Backend

```bash
curl https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-ae24ed01/health
```

Should return:
```json
{"status":"ok"}
```

### Test the Demo App

Visit: `https://YOUR-VERCEL-URL.vercel.app/`

Try logging a meal in the chat interface!

---

## 📱 Install in ChatGPT (1 minute)

### Current Method (Beta - March 2026)

1. Open [chat.openai.com](https://chat.openai.com)
2. Go to **Settings** → **Apps** (or Developer section)
3. Click **"Create App"** or **"Install from URL"**
4. Enter: `https://YOUR-VERCEL-URL.vercel.app/manifest.json`
5. Click **Install** / **Approve**

**Note:** The ChatGPT Apps feature is in beta. If you don't see it:
- Make sure you have ChatGPT Plus
- Check OpenAI's platform for beta signup
- It may be rolling out gradually

---

## 🎉 Use It!

Start a new chat in ChatGPT and say:

```
"I had a chicken sandwich for lunch with 500 calories, 35g protein, 45g carbs, and 18g fats"
```

You should see:
1. ChatGPT acknowledges your meal
2. A Health Ring appears inline showing your progress
3. The ring is emerald green (under goal)

Try these:
- **"Show my nutrition today"** → See your full progress
- **"I ate an apple, about 95 calories"** → Quick log
- **"Set my daily goal to 2200 calories"** → Adjust targets
- **"What did I eat today?"** → List all meals

---

## 🎨 Customization

### Change Ring Colors

Edit `/public/component.html` line ~75:

```javascript
const mainColor = calorieProgress <= 100 ? '#10b981' : '#ef4444';
//                                          ^green    ^red

// Change to your brand colors:
const mainColor = calorieProgress <= 100 ? '#3b82f6' : '#f59e0b';
//                                          ^blue     ^orange
```

### Change Default Goals

Edit `/supabase/functions/server/mcp_handler.tsx` line ~58:

```typescript
goals: {
  calories: 2000,  // Change this
  protein: 150,
  carbs: 200,
  fats: 65,
}
```

### Change Display Mode

Edit `/public/manifest.json`:

```json
"display_mode": "inline"     // Shows in chat
"display_mode": "fullscreen" // Opens in modal
"display_mode": "sidebar"    // Side panel
```

---

## 🐛 Troubleshooting

### "Component not loading"

**Check:**
- Is `component.html` accessible? Visit it directly in browser
- Any CORS errors in console? Check `vercel.json` headers
- Is manifest URL correct? Copy-paste carefully

**Fix:**
```bash
# Redeploy
git commit --allow-empty -m "Force redeploy"
git push
```

### "ChatGPT doesn't call the tool"

**Check:**
- Is MCP endpoint responding? `curl` the health check
- Are tool descriptions clear in manifest.json?
- Try being more explicit: "Log a meal called burger with 500 calories"

**Fix:**
Be more specific in your prompt:
```
"Use the log_meal tool to record: chicken sandwich, 500 calories, 35g protein, 45g carbs, 18g fats"
```

### "State not saving"

**Check:**
- Supabase function logs (Supabase Dashboard → Edge Functions → Logs)
- Network tab shows successful POST to `/log-meal`?
- KV store has data? Test with sync_state

**Fix:**
Check backend logs for errors. Common issue: Date key format wrong.

### "Ring not updating"

**Check:**
- Console errors in component?
- Does `render()` function get called? Add `console.log`
- Is state data correct? Log `currentState` variable

**Fix:**
Add debug logging:
```javascript
function render(state) {
  console.log('Rendering with state:', state);
  // ... rest of function
}
```

---

## 📚 Next Steps

### For Demos:
- Read [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for conversation examples
- Practice the key interactions
- Show the ring turning red (over goal state)

### For Development:
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Read [TESTING_GUIDE.md](./TESTING_GUIDE.md) for thorough testing
- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for advanced config

### For Production:
- Add user authentication (OAuth with OpenAI)
- Implement rate limiting
- Add analytics tracking
- Create proper app icon (512x512 PNG)
- Write user documentation
- Submit to ChatGPT Marketplace

---

## 🎯 Key URLs Checklist

Before going live, verify these URLs work:

- [ ] `https://YOUR-VERCEL-URL.vercel.app/` (Demo app)
- [ ] `https://YOUR-VERCEL-URL.vercel.app/manifest.json` (Returns JSON)
- [ ] `https://YOUR-VERCEL-URL.vercel.app/component.html` (Shows ring)
- [ ] `https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-ae24ed01/health` (Returns ok)
- [ ] `https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-ae24ed01/state` (Returns state)

---

## 💡 Pro Tips

1. **Test Standalone First**: Get the demo app working before integrating with ChatGPT
2. **Use DevTools**: Chrome DevTools Network tab is your friend
3. **Check Logs**: Supabase function logs show exactly what's happening
4. **Start Simple**: Test with a single meal before logging multiple
5. **Natural Language**: ChatGPT is smart - talk naturally, not in JSON

---

## 🆘 Get Help

- **Check Logs**: Vercel + Supabase dashboards
- **Re-read Docs**: [README.md](./README.md) has detailed explanations
- **Test Manually**: Use `curl` to test backend directly
- **Simplify**: Remove complexity until it works, then add back

---

## 🎉 You're Done!

If you've completed this guide, you now have:

✅ A fully deployed ChatGPT native app
✅ A working MCP server with 4 tools
✅ A beautiful Health Ring UI component
✅ Real-time nutrition tracking via conversation
✅ Persistent state storage in Supabase

**Total time: ~10 minutes**

Now go log some meals and show off your new AI-powered nutrition tracker! 🚀

---

Need more details? Check out:
- [README.md](./README.md) - Full documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical deep dive
- [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) - Conversation examples
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Comprehensive testing

Built with ❤️ following the ChatGPT Apps SDK architecture.
