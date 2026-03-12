import * as kv from "./kv_store.tsx";

// Types
export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: string;
}

export interface DailyState {
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

// Helper function to get today's date key
export const getTodayKey = () => {
  const today = new Date();
  return `daily_state:${today.toISOString().split('T')[0]}`;
};

// Helper function to get or create daily state
export const getDailyState = async (): Promise<DailyState> => {
  const key = getTodayKey();
  const existing = await kv.get(key);
  
  if (existing) {
    return existing as DailyState;
  }
  
  // Create new daily state with default goals
  const newState: DailyState = {
    date: new Date().toISOString().split('T')[0],
    meals: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    goals: {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fats: 65,
    },
  };
  
  await kv.set(key, newState);
  return newState;
};

// MCP Tool: log_meal
export async function logMeal(params: {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}) {
  const { name, calories, protein = 0, carbs = 0, fats = 0 } = params;
  
  const state = await getDailyState();
  
  const newMeal: Meal = {
    id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    calories: Number(calories) || 0,
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fats: Number(fats) || 0,
    timestamp: new Date().toISOString(),
  };
  
  state.meals.push(newMeal);
  state.totalCalories += newMeal.calories;
  state.totalProtein += newMeal.protein;
  state.totalCarbs += newMeal.carbs;
  state.totalFats += newMeal.fats;
  
  await kv.set(getTodayKey(), state);
  
  return {
    success: true,
    state,
    message: `✅ Logged ${name}: ${calories} calories, ${protein}g protein, ${carbs}g carbs, ${fats}g fats. Total today: ${state.totalCalories}/${state.goals.calories} calories.`,
  };
}

// MCP Tool: sync_state
export async function syncState() {
  const state = await getDailyState();
  return {
    success: true,
    state,
  };
}

// MCP Tool: delete_meal
export async function deleteMeal(params: { meal_id: string }) {
  const { meal_id } = params;
  const state = await getDailyState();
  
  const mealIndex = state.meals.findIndex(m => m.id === meal_id);
  if (mealIndex === -1) {
    return {
      success: false,
      error: "Meal not found",
    };
  }
  
  const meal = state.meals[mealIndex];
  state.meals.splice(mealIndex, 1);
  state.totalCalories -= meal.calories;
  state.totalProtein -= meal.protein;
  state.totalCarbs -= meal.carbs;
  state.totalFats -= meal.fats;
  
  await kv.set(getTodayKey(), state);
  
  return {
    success: true,
    state,
    message: `Deleted ${meal.name}`,
  };
}

// MCP Tool: update_goals
export async function updateGoals(params: {
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}) {
  const { calories, protein, carbs, fats } = params;
  const state = await getDailyState();
  
  if (calories != null) state.goals.calories = Number(calories);
  if (protein != null) state.goals.protein = Number(protein);
  if (carbs != null) state.goals.carbs = Number(carbs);
  if (fats != null) state.goals.fats = Number(fats);
  
  await kv.set(getTodayKey(), state);
  
  return {
    success: true,
    state,
    message: `Updated goals: ${state.goals.calories} cal, ${state.goals.protein}g protein, ${state.goals.carbs}g carbs, ${state.goals.fats}g fats`,
  };
}
