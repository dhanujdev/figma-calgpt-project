import { useState, useEffect } from 'react';
import { HealthRing } from './components/HealthRing';
import { MealLog, Meal } from './components/MealLog';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Settings, TrendingUp, Plus } from 'lucide-react';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';

interface DailyState {
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

export default function App() {
  const [state, setState] = useState<DailyState | null>(null);
  const [editingGoals, setEditingGoals] = useState(false);
  const [addingMeal, setAddingMeal] = useState(false);
  const [goalInputs, setGoalInputs] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65,
  });
  const [mealInputs, setMealInputs] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-ae24ed01`;

  // Fetch initial state
  useEffect(() => {
    fetchState();
    // Auto-refresh every 5 seconds to sync with ChatGPT changes
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchState = async () => {
    try {
      const response = await fetch(`${API_BASE}/state`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setState(result.state);
        setGoalInputs(result.state.goals);
      }
    } catch (error) {
      console.error('Error fetching state:', error);
    }
  };

  const handleAddMeal = async () => {
    try {
      const response = await fetch(`${API_BASE}/log-meal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          name: mealInputs.name,
          calories: parseInt(mealInputs.calories) || 0,
          protein: parseInt(mealInputs.protein) || 0,
          carbs: parseInt(mealInputs.carbs) || 0,
          fats: parseInt(mealInputs.fats) || 0,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setState(result.state);
        setAddingMeal(false);
        setMealInputs({
          name: '',
          calories: '',
          protein: '',
          carbs: '',
          fats: '',
        });
      }
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const response = await fetch(`${API_BASE}/meal/${mealId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setState(result.state);
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleUpdateGoals = async () => {
    try {
      const response = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(goalInputs),
      });

      const result = await response.json();
      if (result.success) {
        setState(result.state);
        setEditingGoals(false);
      }
    } catch (error) {
      console.error('Error updating goals:', error);
    }
  };

  if (!state) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-10 h-10 text-emerald-500" />
                GPT-Calories
              </h1>
              <p className="text-gray-500 mt-2">
                Native ChatGPT App • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <Dialog open={addingMeal} onOpenChange={setAddingMeal}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Meal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log a Meal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="meal-name">Meal Name</Label>
                    <Input
                      id="meal-name"
                      placeholder="e.g., Chicken Sandwich"
                      value={mealInputs.name}
                      onChange={(e) => setMealInputs({ ...mealInputs, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="meal-cal">Calories</Label>
                      <Input
                        id="meal-cal"
                        type="number"
                        placeholder="500"
                        value={mealInputs.calories}
                        onChange={(e) => setMealInputs({ ...mealInputs, calories: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="meal-protein">Protein (g)</Label>
                      <Input
                        id="meal-protein"
                        type="number"
                        placeholder="35"
                        value={mealInputs.protein}
                        onChange={(e) => setMealInputs({ ...mealInputs, protein: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="meal-carbs">Carbs (g)</Label>
                      <Input
                        id="meal-carbs"
                        type="number"
                        placeholder="45"
                        value={mealInputs.carbs}
                        onChange={(e) => setMealInputs({ ...mealInputs, carbs: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="meal-fats">Fats (g)</Label>
                      <Input
                        id="meal-fats"
                        type="number"
                        placeholder="18"
                        value={mealInputs.fats}
                        onChange={(e) => setMealInputs({ ...mealInputs, fats: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddMeal} className="w-full">
                    Log Meal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <strong>ChatGPT Integration:</strong> In ChatGPT, simply say "I ate a burger with 700 calories" and the Health Ring will update automatically. This demo lets you test the app standalone.
          </p>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Health Ring Card */}
          <Card className="p-8 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Today's Progress</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingGoals(!editingGoals)}
              >
                <Settings className="w-4 h-4 mr-2" />
                {editingGoals ? 'Cancel' : 'Edit Goals'}
              </Button>
            </div>

            {editingGoals ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cal-goal">Calories Goal</Label>
                    <Input
                      id="cal-goal"
                      type="number"
                      value={goalInputs.calories}
                      onChange={(e) => setGoalInputs({ ...goalInputs, calories: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein-goal">Protein Goal (g)</Label>
                    <Input
                      id="protein-goal"
                      type="number"
                      value={goalInputs.protein}
                      onChange={(e) => setGoalInputs({ ...goalInputs, protein: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbs-goal">Carbs Goal (g)</Label>
                    <Input
                      id="carbs-goal"
                      type="number"
                      value={goalInputs.carbs}
                      onChange={(e) => setGoalInputs({ ...goalInputs, carbs: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fats-goal">Fats Goal (g)</Label>
                    <Input
                      id="fats-goal"
                      type="number"
                      value={goalInputs.fats}
                      onChange={(e) => setGoalInputs({ ...goalInputs, fats: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <Button onClick={handleUpdateGoals}>Save Goals</Button>
              </div>
            ) : (
              <HealthRing
                calories={{
                  current: state.totalCalories,
                  goal: state.goals.calories,
                  color: state.totalCalories <= state.goals.calories ? '#10b981' : '#ef4444',
                }}
                protein={{
                  current: state.totalProtein,
                  goal: state.goals.protein,
                  color: '#3b82f6',
                }}
                carbs={{
                  current: state.totalCarbs,
                  goal: state.goals.carbs,
                  color: '#f97316',
                }}
                fats={{
                  current: state.totalFats,
                  goal: state.goals.fats,
                  color: '#a855f7',
                }}
              />
            )}
          </Card>

          {/* Meals Card */}
          <Card className="p-6 bg-white/80 backdrop-blur">
            <MealLog meals={state.meals} onDeleteMeal={handleDeleteMeal} />
          </Card>
        </div>
      </div>
    </div>
  );
}