# 🧪 ChatGPT Testing Script

## Test Conversation Flow

Use this script to test GPT-Calories in ChatGPT once deployed:

### Test 1: Basic Meal Logging

**You:** Hi! I just ate a chicken sandwich.

**Expected GPT Response:**
- GPT should ask for nutritional details or estimate them
- Then call `log_meal` tool
- Health Ring should appear showing updated calories

**You:** It had about 500 calories, 35g protein, 45g carbs, and 18g fats.

**Expected:**
- Health Ring updates inline
- Shows 500/2000 calories
- Macro rings show protein/carbs/fats progress

---

### Test 2: Simple Natural Language

**You:** I ate a burger with 700 calories

**Expected:**
- GPT calls `log_meal` with calories=700
- Asks if you know the macros, or estimates them
- Health Ring appears/updates

---

### Test 3: Multiple Meals

**You:** 
```
Breakfast: Oatmeal with berries - 350 calories, 12g protein, 65g carbs, 8g fats
Lunch: Grilled salmon - 450 calories, 40g protein, 5g carbs, 28g fats
```

**Expected:**
- GPT logs both meals
- Health Ring shows combined totals
- Meal list shows both entries

---

### Test 4: Check Progress

**You:** How am I doing on my calories today?

**Expected:**
- GPT calls `sync_state` tool
- Shows current progress
- Health Ring displays with current state

---

### Test 5: Delete a Meal

**You:** Actually, I didn't have that burger. Can you remove it?

**Expected:**
- GPT calls `delete_meal` with the meal ID
- Health Ring updates to remove those calories
- Meal list refreshes

---

### Test 6: Update Goals

**You:** I want to increase my protein goal to 180g per day

**Expected:**
- GPT calls `update_goals` with protein=180
- Health Ring refreshes with new goal
- Protein ring shows updated target

---

### Test 7: Context Persistence

**You:** [Start new chat] What did I eat today?

**Expected:**
- GPT calls `sync_state`
- Shows all meals from today (date-based)
- Health Ring displays current progress

---

### Test 8: Complex Meal

**You:** I had Chipotle: burrito bowl with chicken, brown rice, black beans, fajita veggies, cheese, sour cream, and guac

**Expected:**
- GPT estimates nutritional info (or asks for it)
- Logs meal with reasonable calorie estimate (~850 cal)
- Breaks down approximate macros

---

## Visual Tests

### Health Ring Color Test

1. **Under Goal (Green):**
   - Log meals totaling < 2000 cal
   - Ring should be emerald green (#10b981)

2. **Over Goal (Red):**
   - Log meals totaling > 2000 cal
   - Ring should turn red (#ef4444)

3. **At Goal:**
   - Log exactly 2000 calories
   - Ring should be full circle, still green

### Macro Ring Tests

- **Protein Ring** (Blue): Should fill as you add protein
- **Carbs Ring** (Orange): Should track carbohydrate intake
- **Fats Ring** (Purple): Should track fat consumption

---

## Edge Cases to Test

### Test 9: Zero Macros

**You:** I drank 200ml of water - 0 calories

**Expected:**
- GPT acknowledges but doesn't log (0 calories)
- OR logs with 0 values
- Health Ring unchanged

### Test 10: Only Calories Known

**You:** I ate something with 300 calories but don't know the macros

**Expected:**
- GPT logs with calories=300, protein/carbs/fats=0
- Health Ring updates calories only
- Macro rings unchanged

### Test 11: Extremely High Values

**You:** I ate 5000 calories today (cheat day!)

**Expected:**
- GPT logs the meal
- Ring turns red (over goal)
- Still displays correctly at > 100%

### Test 12: Delete All Meals

**You:** Clear all my meals for today

**Expected:**
- GPT deletes all meals
- Health Ring resets to 0
- Empty state: "No meals logged yet"

---

## MCP Tool Call Validation

Monitor the browser console or server logs to verify:

### `log_meal` Call Format
```json
{
  "method": "log_meal",
  "params": {
    "name": "Chicken Sandwich",
    "calories": 500,
    "protein": 35,
    "carbs": 45,
    "fats": 18
  }
}
```

### `sync_state` Call Format
```json
{
  "method": "sync_state",
  "params": {}
}
```

### Expected Response
```json
{
  "success": true,
  "state": {
    "date": "2026-03-12",
    "meals": [...],
    "totalCalories": 1200,
    "totalProtein": 85,
    "totalCarbs": 115,
    "totalFats": 54,
    "goals": {
      "calories": 2000,
      "protein": 150,
      "carbs": 200,
      "fats": 65
    }
  },
  "message": "✅ Logged Chicken Sandwich: 500 calories..."
}
```

---

## Performance Tests

1. **Load Time:**
   - Health Ring should appear within 1-2 seconds
   - No flickering or layout shifts

2. **Update Speed:**
   - After logging a meal, ring should update immediately
   - Smooth animation (0.5s transition)

3. **State Sync:**
   - Opening in new tab should show same data
   - Real-time updates across sessions

---

## Accessibility Tests

1. **Screen Reader:**
   - Ring values should be readable
   - Meal names and macros announced

2. **Keyboard Navigation:**
   - Can navigate through meal list
   - Focus states visible

3. **Color Contrast:**
   - Text readable on all backgrounds
   - WCAG AA compliant

---

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Safari (WebKit)
- ✅ Firefox
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

---

## Final Checklist

- [ ] Manifest.json loads without errors
- [ ] component.html renders correctly
- [ ] MCP endpoint responds to all tool calls
- [ ] Health Ring displays and updates
- [ ] Meal log shows all entries
- [ ] Delete functionality works
- [ ] Goals can be updated
- [ ] Data persists across sessions
- [ ] Ring color changes based on goal
- [ ] Smooth animations work
- [ ] No console errors
- [ ] Mobile responsive

---

## Sample Full Conversation

**You:** Hey! I'm tracking my calories today. Can you help?

**GPT:** Of course! I'll help you track your nutrition with the Health Ring. What did you eat?

**You:** Breakfast: 2 eggs, toast, and coffee with milk - about 400 calories

**GPT:** ✅ Logged Breakfast: 400 calories. [Health Ring appears]

**You:** Lunch was a Caesar salad with chicken - 550 calories, 45g protein, 30g carbs, 25g fats

**GPT:** ✅ Logged Caesar salad: 550 calories, 45g protein, 30g carbs, 25g fats. You're at 950/2000 calories for today! [Health Ring updates]

**You:** How much protein do I have left?

**GPT:** You've consumed 45g of protein so far, with a goal of 150g. You have 105g remaining. Great job getting some protein at lunch!

**You:** Perfect, thanks!

---

## Debug Mode

If issues occur, enable debug logging in `component.html`:

```javascript
console.log('State updated:', currentState);
console.log('Progress:', calorieProgress);
```

Check Supabase function logs:
```bash
supabase functions logs make-server-ae24ed01
```

---

**Pro Tip:** Use ChatGPT's "Regenerate" feature if the tool calls don't trigger. The model might need a nudge to use the MCP tools!
