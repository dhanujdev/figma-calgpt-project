# 🧪 Testing Guide for GPT-Calories

This guide helps you test your GPT-Calories app at every stage of development.

## Testing Levels

### Level 1: Backend API Testing ✅

Test your MCP server endpoints directly.

#### Test the Health Check

```bash
curl https://YOUR-VERCEL-URL.vercel.app/mcp
```

Expected response:
```json
{
  "ok": true,
  "endpoint": "/api/mcp",
  "message": "MCP endpoint is up. Use POST with JSON-RPC body."
}
```

#### Test Sync State

```bash
curl -X GET \
  https://YOUR-VERCEL-URL.vercel.app/api/state
```

Expected response:
```json
{
  "success": true,
  "state": {
    "date": "2026-03-12",
    "meals": [],
    "totalCalories": 0,
    "totalProtein": 0,
    "totalCarbs": 0,
    "totalFats": 0,
    "goals": {
      "calories": 2000,
      "protein": 150,
      "carbs": 200,
      "fats": 65
    }
  }
}
```

#### Test Log Meal

```bash
curl -X POST \
  https://YOUR-VERCEL-URL.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "log_meal",
      "arguments": {
        "name": "Test Burger",
        "calories": 700,
        "protein": 35,
        "carbs": 50,
        "fats": 30
      }
    }
  }'
```

Expected response:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "isError": false,
    "structuredContent": {
      "success": true
    }
  }
}
```

#### Test MCP Endpoint

```bash
curl -X POST \
  https://YOUR-VERCEL-URL.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "log_meal",
      "arguments": {
        "name": "Chicken Sandwich",
        "calories": 500,
        "protein": 35,
        "carbs": 45,
        "fats": 18
      }
    }
  }'
```

### Level 2: Web Component Testing 🎨

Test the UI component independently.

#### Local Testing

1. Open `/public/component.html` in your browser
2. Open DevTools Console
3. Check for any JavaScript errors
4. You should see "No meals logged yet" if the backend is empty

#### Test State Updates

Add this to your browser console:

```javascript
// Simulate a state update
const mockState = {
  date: "2026-03-12",
  meals: [
    {
      id: "test1",
      name: "Breakfast",
      calories: 400,
      protein: 20,
      carbs: 50,
      fats: 15,
      timestamp: new Date().toISOString()
    }
  ],
  totalCalories: 400,
  totalProtein: 20,
  totalCarbs: 50,
  totalFats: 15,
  goals: {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65
  }
};

render(mockState);
```

You should see the Health Ring update with the mock data!

#### Test Responsiveness

1. Open DevTools and toggle device toolbar
2. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1440px)
3. Verify the rings scale properly

### Level 3: React Demo App Testing 🖥️

Test the full React application.

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and test:

1. **Initial Load**
   - Health Ring shows 0 calories
   - "No meals logged yet" message appears

2. **Log a Meal**
   - Type: "I ate a burger with 700 calories, 35g protein, 50g carbs, and 30g fats"
   - Click Send
   - Verify the meal appears in the log
   - Verify the Health Ring updates

3. **Delete a Meal**
   - Click the trash icon on a logged meal
   - Verify it's removed
   - Verify totals recalculate

4. **Update Goals**
   - Click the Settings icon
   - Change calorie goal to 2500
   - Click Save
   - Verify the ring updates with new goal

5. **Over-Goal State**
   - Log enough meals to exceed your calorie goal
   - Verify the ring turns RED (#ef4444)

### Level 4: Integration Testing with ChatGPT 💬

Once deployed and installed in ChatGPT:

#### Test Conversation Flow

1. **Basic Meal Logging**
   ```
   User: "I had oatmeal for breakfast with 300 calories, 10g protein, 50g carbs, 5g fats"
   Expected: ChatGPT logs the meal and shows updated Health Ring
   ```

2. **Natural Language**
   ```
   User: "I ate a chicken salad, probably around 450 calories"
   Expected: ChatGPT estimates macros and logs it
   ```

3. **State Check**
   ```
   User: "What have I eaten today?"
   Expected: ChatGPT lists all meals from the state
   ```

4. **Goal Updates**
   ```
   User: "I'm trying to hit 2200 calories per day"
   Expected: ChatGPT updates your goals
   ```

5. **Context Understanding**
   ```
   User: "I'm over my goal, what should I do?"
   Expected: ChatGPT reads state and gives advice
   ```

#### Test Edge Cases

1. **Very Large Meal**
   ```
   User: "I had a huge buffet, like 2000 calories"
   Expected: Should log without errors
   ```

2. **Negative Numbers** (should fail gracefully)
   ```
   User: "I ate -500 calories"
   Expected: ChatGPT should ask for clarification
   ```

3. **Missing Data**
   ```
   User: "I had pizza"
   Expected: ChatGPT should ask for calorie amount
   ```

4. **Multiple Meals at Once**
   ```
   User: "For lunch I had a sandwich (500 cal) and chips (200 cal)"
   Expected: ChatGPT logs both as separate meals
   ```

### Level 5: Performance Testing ⚡

#### Load Time

1. Open DevTools Network tab
2. Load the component
3. Metrics to check:
   - Component load: < 500ms
   - API response: < 200ms
   - First paint: < 1s

#### Stress Testing

```bash
# Send 100 rapid requests
for i in {1..100}; do
  curl -X POST \
    https://YOUR-VERCEL-URL.vercel.app/mcp \
    -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":$i,\"method\":\"tools/call\",\"params\":{\"name\":\"log_meal\",\"arguments\":{\"name\":\"Meal $i\",\"calories\":100}}}" &
done
```

Server should handle all requests without crashing.

### Level 6: Security Testing 🔒

#### CORS Testing

```bash
# Test CORS headers
curl -I https://YOUR-VERCEL-URL.vercel.app/component.html
```

Should include:
```
Access-Control-Allow-Origin: *
```

#### Authentication

Test unauthorized access:

```bash
# Public proxy check (Vercel route should still return a valid response shape)
curl https://YOUR-VERCEL-URL.vercel.app/api/state
```

#### Input Validation

Try to break the API:

```bash
# SQL injection attempt
curl -X POST https://YOUR-VERCEL-URL.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":101,"method":"tools/call","params":{"name":"log_meal","arguments":{"name":"DROP TABLE users--","calories":500}}}'

# XSS attempt
curl -X POST https://YOUR-VERCEL-URL.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":102,"method":"tools/call","params":{"name":"log_meal","arguments":{"name":"<script>alert(1)</script>","calories":500}}}'

# Huge number
curl -X POST https://YOUR-VERCEL-URL.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":103,"method":"tools/call","params":{"name":"log_meal","arguments":{"name":"Food","calories":999999999}}}'
```

All should be handled safely.

## Automated Testing

### Unit Tests (Optional)

Create `/tests/mcp-handler.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { logMeal, syncState } from '../supabase/functions/server/mcp_handler';

describe('MCP Handler', () => {
  it('should log a meal', async () => {
    const result = await logMeal({
      name: 'Test',
      calories: 100,
      protein: 10,
      carbs: 15,
      fats: 5
    });
    
    expect(result.success).toBe(true);
    expect(result.state.meals.length).toBeGreaterThan(0);
  });
  
  it('should sync state', async () => {
    const result = await syncState();
    expect(result.success).toBe(true);
    expect(result.state).toBeDefined();
  });
});
```

Run with:
```bash
npm install -D vitest
npm test
```

### E2E Tests with Playwright (Optional)

```bash
npm install -D @playwright/test

# Create test file
```

```typescript
// tests/e2e.spec.ts
import { test, expect } from '@playwright/test';

test('Health Ring loads', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Wait for ring to appear
  await expect(page.locator('.main-ring')).toBeVisible();
  
  // Check initial state
  await expect(page.locator('.ring-value')).toHaveText('0');
});

test('Can log a meal', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Type message
  await page.fill('input[placeholder*="ate"]', 
    'I ate a burger with 700 calories, 35g protein, 50g carbs, 30g fats');
  
  // Send
  await page.click('button[type="submit"]');
  
  // Verify meal appears
  await expect(page.locator('.meal-item')).toContainText('burger');
  
  // Verify ring updates
  await expect(page.locator('.ring-value')).toHaveText('700');
});
```

Run with:
```bash
npx playwright test
```

## Debugging Tips

### Component Not Updating

1. Check browser console for errors
2. Verify API is returning data
3. Check if `render()` function is being called
4. Inspect the `currentState` variable in console

### ChatGPT Not Calling Tools

1. Verify manifest.json is accessible
2. Check tool descriptions are clear
3. Try being more explicit in your prompts
4. Check ChatGPT's response for any error messages

### State Not Persisting

1. Check Supabase logs for errors
2. Verify KV store has data:
   ```bash
   # Check what keys exist
   curl https://YOUR-VERCEL-URL.vercel.app/api/state | jq '.state.date'
   ```
3. Confirm date key format is correct

### Performance Issues

1. Check Supabase function logs for slow queries
2. Enable Vercel Analytics for frontend metrics
3. Consider caching frequently accessed data
4. Optimize ring rendering (use CSS transforms)

## Monitoring in Production

### Set Up Alerts

**Vercel:**
- Configure deployment notifications
- Set up error alerts
- Enable analytics

**Supabase:**
- Monitor function invocations
- Set up error rate alerts
- Track response times

### Regular Health Checks

Create a simple monitoring script:

```bash
#!/bin/bash
# health-check.sh

HEALTH_URL="https://YOUR-VERCEL-URL.vercel.app/mcp"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $response -eq 200 ]; then
  echo "✅ API is healthy"
  exit 0
else
  echo "❌ API is down (HTTP $response)"
  exit 1
fi
```

Run it with cron:
```
*/5 * * * * /path/to/health-check.sh
```

---

## Testing Checklist

Before deploying to production:

- [ ] All backend endpoints return 200 OK
- [ ] Web component loads without errors
- [ ] React demo works end-to-end
- [ ] ChatGPT can call all MCP tools
- [ ] Health Ring updates correctly
- [ ] Over-goal state turns red
- [ ] Meals persist across reloads
- [ ] Mobile responsive
- [ ] CORS headers are correct
- [ ] No console errors
- [ ] Manifest.json is accessible
- [ ] Icon displays properly

Once all checkboxes are complete, you're ready for production! 🚀
