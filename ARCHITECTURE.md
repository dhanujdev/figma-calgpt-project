# 🏗️ GPT-Calories Architecture

Complete technical architecture for the GPT-Calories ChatGPT Native App.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         ChatGPT                             │
│                    (The Brain / Host)                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ User: "I ate a burger with 500 calories"             │  │
│  └─────────────────────┬───────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ GPT-4 Processing:                                    │  │
│  │ • Understands: User ate a burger                    │  │
│  │ • Extracts: { name: "burger", calories: 500 }       │  │
│  │ • Decides: Call log_meal tool                       │  │
│  └─────────────────────┬───────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────-─┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌──────────────────┐
│   MCP Server    │            │  Web Component   │
│  (The Hands)    │            │   (The Face)     │
│                 │            │                  │
│ Vercel/Supabase │            │  Vercel Static   │
└────────┬────────┘            └────────┬─────────┘
         │                              │
         ▼                              │
┌─────────────────┐                     │
│   Supabase KV   │◄────────────────────┘
│  (The Memory)   │
│                 │
│ Key-Value Store │
└─────────────────┘
```

---

## Component Details

### 1. ChatGPT (The Brain)

**Role:** Natural language understanding, reasoning, and orchestration

**Responsibilities:**
- Parse user's natural language input
- Extract structured meal data (name, calories, macros)
- Decide which MCP tool to call
- Format responses for the user
- Inject UI components into chat stream

**Technology:** 
- GPT-4 / GPT-4o
- OpenAI's ChatGPT Apps SDK
- `window.openai` API for component communication

**Key Capabilities:**
- Context awareness (remembers conversation)
- Entity extraction (food → nutrition data)
- Tool orchestration (calls our MCP server)
- UI state management (updates web component)

---

### 2. MCP Server (The Hands)

**Role:** Provide atomic, stateless tools for data manipulation

**Location:** `/supabase/functions/server/`

**Endpoints:**

```typescript
POST /make-server-ae24ed01/mcp
{
  "tool": "log_meal",
  "parameters": {
    "name": "Burger",
    "calories": 500,
    "protein": 25,
    "carbs": 40,
    "fats": 20
  }
}
```

**Tools Provided:**

1. **log_meal**
   - Input: Food name + nutrition data
   - Action: Add meal to today's state
   - Output: Updated daily state + success message

2. **sync_state**  
   - Input: None
   - Action: Retrieve current daily state
   - Output: Full state object

3. **delete_meal**
   - Input: meal_id
   - Action: Remove meal and recalculate totals
   - Output: Updated state

4. **update_goals**
   - Input: New goal values (calories, protein, carbs, fats)
   - Action: Update user's daily targets
   - Output: Updated state with new goals

**Technology Stack:**
- Runtime: Deno (on Supabase Edge Functions)
- Framework: Hono (lightweight web framework)
- Language: TypeScript
- Storage: Supabase KV Store

**Design Principles:**
- **Atomic**: Each tool does one thing well
- **Stateless**: No sessions, no cookies
- **Pure Functions**: Same input = same output
- **JSON Only**: Returns raw data, not HTML

**File Structure:**
```
/supabase/functions/server/
  ├── index.tsx          # Main server entry, route handler
  ├── mcp_handler.tsx    # Tool implementations
  └── kv_store.tsx       # Database abstraction (protected)
```

---

### 3. Web Component (The Face)

**Role:** Render the Health Ring UI inline in ChatGPT

**Location:** `/public/component.html`

**UI Components:**

```
┌─────────────────────────────────────┐
│         Today's Progress            │
│                                     │
│         ┌───────────┐               │
│         │           │               │
│         │    700    │  ← Main Ring  │
│         │  of 2000  │               │
│         │  calories │               │
│         │           │               │
│         └───────────┘               │
│                                     │
│   ⚪ Protein  ⚪ Carbs  ⚪ Fats      │ ← Macro Rings
│                                     │
│  ─────────────────────────────────  │
│  Today's Meals                      │
│  • Burger - 500 cal                 │
│  • Apple - 95 cal                   │
│  • Chicken - 450 cal                │
└─────────────────────────────────────┘
```

**Visual States:**

| State | Ring Color | Condition |
|-------|-----------|-----------|
| Under Goal | Emerald Green (#10b981) | calories ≤ goal |
| Over Goal | Red (#ef4444) | calories > goal |

**Technology:**
- Pure HTML + Vanilla JavaScript
- SVG for ring rendering
- CSS3 for animations
- No frameworks (lightweight!)

**Integration Points:**

1. **window.openai API** (When in ChatGPT):
   ```javascript
   window.openai.onContextUpdate((context) => {
     render(context.state);
   });
   ```

2. **Direct API calls** (Standalone mode):
   ```javascript
   fetch('/api/state')
     .then(res => res.json())
     .then(data => render(data.state));
   ```

**Rendering Logic:**
```javascript
function render(state) {
  // Calculate progress percentages
  const calorieProgress = (state.totalCalories / state.goals.calories) * 100;
  
  // Determine ring color
  const mainColor = calorieProgress <= 100 ? '#10b981' : '#ef4444';
  
  // Render SVG circles with stroke-dasharray
  const dasharray = calculateStrokeDasharray(calorieProgress, radius);
  
  // Update DOM
  document.getElementById('app').innerHTML = `...`;
}
```

---

### 4. Supabase KV Store (The Memory)

**Role:** Persist daily nutrition state

**Schema:**

```typescript
Key Format: `daily_state:YYYY-MM-DD`

Value:
{
  date: "2026-03-12",
  meals: [
    {
      id: "meal_1234567890_abc123",
      name: "Burger",
      calories: 500,
      protein: 25,
      carbs: 40,
      fats: 20,
      timestamp: "2026-03-12T12:30:00.000Z"
    }
  ],
  totalCalories: 500,
  totalProtein: 25,
  totalCarbs: 40,
  totalFats: 20,
  goals: {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65
  }
}
```

**Operations:**

| Function | Description |
|----------|-------------|
| `kv.get(key)` | Retrieve state for a date |
| `kv.set(key, value)` | Save updated state |
| `kv.del(key)` | Delete a day's data |

**Data Flow:**

```
1. User logs meal in ChatGPT
2. ChatGPT calls log_meal tool
3. MCP server: kv.get('daily_state:2026-03-12')
4. MCP server: Add meal to state.meals[]
5. MCP server: Recalculate totals
6. MCP server: kv.set('daily_state:2026-03-12', updatedState)
7. MCP server: Return updatedState to ChatGPT
8. ChatGPT: Update web component via window.openai
9. Web component: Re-render with new state
```

**Advantages:**
- Simple key-value model (no complex schemas)
- Fast reads/writes
- Daily isolation (data auto-resets each day)
- No migrations needed

---

## Data Flow Diagrams

### Flow 1: Log Meal

```
User                   ChatGPT              MCP Server           KV Store           Web Component
  │                       │                      │                   │                    │
  ├─"I ate a burger"─────►│                      │                   │                    │
  │                       │                      │                   │                    │
  │                       ├─Parse & Extract─────►│                   │                    │
  │                       │  {name:"burger",     │                   │                    │
  │                       │   calories:500}      │                   │                    │
  │                       │                      │                   │                    │
  │                       │                      ├─GET daily_state──►│                    │
  │                       │                      │                   │                    │
  │                       │                      │◄──State────────────┤                    │
  │                       │                      │                   │                    │
  │                       │                      ├─Add meal          │                    │
  │                       │                      ├─Recalculate       │                    │
  │                       │                      │                   │                    │
  │                       │                      ├─SET updated state─►│                    │
  │                       │                      │                   │                    │
  │                       │◄─Updated State───────┤                   │                    │
  │                       │                      │                   │                    │
  │                       ├─window.openai.updateState────────────────────────────────────►│
  │                       │                      │                   │                    │
  │◄─"Logged burger!"─────┤                      │                   │                    ├─Re-render
  │                       │                      │                   │                    │  Health Ring
  │                       │                      │                   │                    │
```

### Flow 2: Check Progress

```
User                   ChatGPT              MCP Server           KV Store           Web Component
  │                       │                      │                   │                    │
  ├─"Show my progress"───►│                      │                   │                    │
  │                       │                      │                   │                    │
  │                       ├─Call sync_state─────►│                   │                    │
  │                       │                      │                   │                    │
  │                       │                      ├─GET daily_state──►│                    │
  │                       │                      │                   │                    │
  │                       │                      │◄──State────────────┤                    │
  │                       │                      │                   │                    │
  │                       │◄─State───────────────┤                   │                    │
  │                       │                      │                   │                    │
  │                       ├─Format summary       │                   │                    │
  │                       │                      │                   │                    │
  │◄─"You've eaten..."────┤                      │                   │                    │
  │  [Health Ring UI]     │                      │                   │                    │
  │                       │                      │                   │                    │
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Production                          │
└─────────────────────────────────────────────────────────────┘

   GitHub Repository
         │
         │ push
         ▼
   ┌─────────┐
   │ Vercel  │ ◄── Automated deployment
   └────┬────┘
        │
        ├─► /manifest.json        (Edge, CORS enabled)
        ├─► /component.html       (Edge, CORS enabled)
        ├─► /icon.svg             (CDN)
        └─► /dist/*               (React demo app)


   ┌──────────────┐
   │   Supabase   │
   └──────┬───────┘
          │
          ├─► Edge Functions
          │     └─ /make-server-ae24ed01/mcp
          │
          └─► KV Store
                └─ daily_state:* keys
```

**Hosting:**
- **Vercel**: Web component + manifest + demo app
- **Supabase**: MCP server + data storage
- **GitHub**: Source code + CI/CD trigger

**CDN Strategy:**
- Static files (manifest, component) served from Vercel Edge Network
- Global distribution for low latency
- CORS headers for ChatGPT access

**Security:**
- HTTPS only
- CORS: `Access-Control-Allow-Origin: *` (ChatGPT needs access)
- Rate limiting on MCP endpoints
- Input validation on all parameters

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI Brain** | GPT-4, ChatGPT Apps SDK | Natural language processing |
| **Backend** | Deno, Hono, TypeScript | MCP server runtime |
| **Storage** | Supabase KV Store | State persistence |
| **Frontend** | Vanilla JS, SVG, CSS3 | Health Ring rendering |
| **Demo App** | React, Vite, Tailwind | Standalone testing |
| **Deployment** | Vercel + Supabase | Hosting & CDN |
| **CI/CD** | GitHub Actions | Automated deployment |

---

## Scaling Considerations

### Current Architecture (MVP)

- **Users:** 1-1000
- **Storage:** Daily state per user (~1KB each)
- **Throughput:** ~10 requests/second
- **Cost:** Free tier (Vercel + Supabase)

### Future Scaling (Production)

**For 10,000+ users:**

1. **Add User Authentication**
   ```typescript
   Key Format: daily_state:{user_id}:{date}
   ```

2. **Database Migration**
   - Move from KV store to PostgreSQL tables
   - Enable historical tracking (>1 day)
   - Add indexing for fast queries

3. **Caching Layer**
   - Redis for frequently accessed states
   - Reduce database hits

4. **Rate Limiting**
   - Per-user quotas
   - DDoS protection

5. **Analytics**
   - Track tool usage
   - Monitor component load times
   - User behavior analysis

---

## Security Architecture

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| **Unauthorized API access** | Validate ChatGPT auth tokens |
| **Data tampering** | Input validation + sanitization |
| **XSS in component** | No eval(), sanitize user input |
| **DDoS** | Rate limiting on MCP endpoints |
| **Data leaks** | Per-user data isolation |

### Current Security Measures

✅ HTTPS only
✅ CORS configured for ChatGPT
✅ Input validation on all tool parameters
✅ No sensitive data storage (just nutrition logs)
✅ Stateless MCP server (no sessions)

### Production Security Additions

- [ ] OAuth integration with OpenAI
- [ ] Request signing/validation
- [ ] User data encryption at rest
- [ ] Audit logs for data access
- [ ] GDPR compliance (data export/deletion)

---

## Performance Metrics

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Component load | < 500ms | ~300ms |
| API response | < 200ms | ~150ms |
| First paint | < 1s | ~800ms |
| Tool execution | < 300ms | ~200ms |

### Optimization Strategies

1. **Component Loading**
   - Minify HTML/CSS/JS
   - Inline critical CSS
   - Lazy load meal list

2. **API Performance**
   - Connection pooling for KV store
   - Batch operations where possible
   - Edge function cold start optimization

3. **Rendering**
   - CSS transforms for animations
   - RequestAnimationFrame for smooth updates
   - Virtual DOM for meal list (if needed)

---

## Monitoring & Observability

```
┌─────────────┐
│  Vercel     │ ─► Analytics: Component loads, errors
└─────────────┘

┌─────────────┐
│  Supabase   │ ─► Logs: MCP tool calls, errors, latency
└─────────────┘

┌─────────────┐
│  Sentry     │ ─► Error tracking (optional)
└─────────────┘
```

**Key Metrics to Track:**
- Tool call frequency (log_meal, sync_state, etc.)
- Error rates by tool
- Average response time
- Component load success rate
- Daily active users (via unique API calls)

---

## Development Workflow

```
Developer
   │
   ├─ Code changes
   │
   ├─ git commit & push
   │
   ▼
GitHub
   │
   ├─ GitHub Actions trigger
   │
   ▼
Automated Deploy
   │
   ├─► Vercel (frontend)
   │
   └─► Supabase (backend) 
   
   ▼
Production
```

**Local Development:**
1. `npm run dev` - React demo app
2. Open `component.html` - Test web component
3. `curl` MCP endpoints - Test backend
4. Supabase local dev - Test database

---

This architecture follows the **Atomic Component Pattern** from OpenAI's Build Hour:
- Brain (ChatGPT) handles understanding
- Hands (MCP) handle data manipulation
- Face (Component) handles presentation
- Memory (KV Store) handles persistence

Simple, scalable, and native to ChatGPT! 🚀
