import { useState, useMemo, useEffect } from 'react';
import {
  FoodItem,
  LoggedFoodEntry,
  MealSlot,
  SavedMealTemplate,
  UserProfile,
  AppSettings
} from '../types';
import {
  FOOD_DATABASE,
  calculateMacroTargets
} from '../utils/nutritionDatabase';
import {
  Utensils,
  Search,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Flame,
  Beef,
  Wheat,
  Droplet,
  AlertTriangle,
  Scale,
  History,
  Copy,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NutritionTrackerProps {
  profile: UserProfile | null;
  settings?: Partial<AppSettings>;
  triggerToast: (msg: string) => void;
  onLogsChange?: (logs: Record<string, LoggedFoodEntry[]>) => void;
}

const MEAL_SLOTS: MealSlot[] = [
  'Breakfast',
  'Mid-Morning',
  'Lunch',
  'Evening Snack',
  'Pre-Workout',
  'Post-Workout',
  'Dinner'
];

const CATEGORIES = [
  'All',
  'South Indian',
  'Protein',
  'Grains & Carbs',
  'Dairy & Beverages',
  'Fruits & Veggies',
  'Snacks & Fast Food',
  'Custom'
] as const;

export default function NutritionTracker({
  profile,
  settings,
  triggerToast,
  onLogsChange
}: NutritionTrackerProps) {
  const userKey = profile?.name || 'Athlete';
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeSlot, setActiveSlot] = useState<MealSlot>('Breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState(false);

  // Selected food modal / quick-add state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [unitMode, setUnitMode] = useState<'serving' | 'grams'>('serving');
  const [quantity, setQuantity] = useState<string>('1');

  // Custom Food Modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customServingLabel, setCustomServingLabel] = useState('1 serving (100g)');
  const [customGrams, setCustomGrams] = useState('100');
  const [customCals, setCustomCals] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFats, setCustomFats] = useState('');
  const [customFiber, setCustomFiber] = useState('2');

  // Persistent state
  const [nutritionLogs, setNutritionLogs] = useState<Record<string, LoggedFoodEntry[]>>(() => {
    try {
      const raw = localStorage.getItem(`lv_nutrition_logs_${userKey}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [customFoods, setCustomFoods] = useState<FoodItem[]>(() => {
    try {
      const raw = localStorage.getItem(`lv_custom_foods_${userKey}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [savedMeals, setSavedMeals] = useState<SavedMealTemplate[]>(() => {
    try {
      const raw = localStorage.getItem(`lv_saved_meals_${userKey}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`lv_nutrition_logs_${userKey}`, JSON.stringify(nutritionLogs));
      onLogsChange?.(nutritionLogs);
    } catch (e) {
      console.warn('Failed to save nutrition logs:', e);
    }
  }, [nutritionLogs, userKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`lv_custom_foods_${userKey}`, JSON.stringify(customFoods));
    } catch {}
  }, [customFoods, userKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`lv_saved_meals_${userKey}`, JSON.stringify(savedMeals));
    } catch {}
  }, [savedMeals, userKey]);

  const allFoods = useMemo(() => [...customFoods, ...FOOD_DATABASE], [customFoods]);

  const targets = useMemo(() => calculateMacroTargets(profile, settings), [profile, settings]);

  const dayEntries = useMemo(() => nutritionLogs[selectedDate] || [], [nutritionLogs, selectedDate]);

  const dayTotals = useMemo(() => {
    return dayEntries.reduce(
      (acc, item) => {
        acc.calories += item.calories || 0;
        acc.protein += item.protein || 0;
        acc.carbs += item.carbs || 0;
        acc.fats += item.fats || 0;
        acc.fiber += item.fiber || 0;
        acc.sugar += item.sugar || 0;
        acc.sodium += item.sodium || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0 }
    );
  }, [dayEntries]);

  // Recent & Frequent foods
  const recentFoodIds = useMemo(() => {
    const counts = new Map<string, number>();
    Object.values(nutritionLogs)
      .flat()
      .forEach((entry) => {
        counts.set(entry.foodId, (counts.get(entry.foodId) || 0) + 1);
      });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => id);
  }, [nutritionLogs]);

  const filteredFoods = useMemo(() => {
    return allFoods.filter((f) => {
      if (vegOnly && f.isVeg === false) return false;
      if (selectedCategory !== 'All' && f.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allFoods, vegOnly, selectedCategory, searchQuery]);

  // Live preview of macros for selected food + quantity
  const previewMacros = useMemo(() => {
    if (!selectedFood) return null;
    const qty = Math.max(0.1, parseFloat(quantity) || 0);
    const multiplier =
      unitMode === 'serving'
        ? qty
        : qty / (selectedFood.gramsPerUnit || 100);

    return {
      gramsTotal: Math.round(
        unitMode === 'serving' ? qty * selectedFood.gramsPerUnit : qty
      ),
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Number((selectedFood.protein * multiplier).toFixed(1)),
      carbs: Number((selectedFood.carbs * multiplier).toFixed(1)),
      fats: Number((selectedFood.fats * multiplier).toFixed(1)),
      fiber: Number((selectedFood.fiber * multiplier).toFixed(1)),
      sugar: Number(((selectedFood.sugar || 0) * multiplier).toFixed(1)),
      sodium: Math.round((selectedFood.sodium || 0) * multiplier)
    };
  }, [selectedFood, quantity, unitMode]);

  const handleLogFood = (food: FoodItem, customQty?: number, mode: 'serving' | 'grams' = 'serving') => {
    const qty = customQty !== undefined ? customQty : Math.max(0.1, parseFloat(quantity) || 1);
    const multiplier = mode === 'serving' ? qty : qty / (food.gramsPerUnit || 100);

    const newEntry: LoggedFoodEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      foodId: food.id,
      foodName: food.name,
      mealSlot: activeSlot,
      quantity: qty,
      unitMode: mode,
      servingLabel: mode === 'serving' ? `${qty} × ${food.servingLabel}` : `${qty}g`,
      gramsTotal: Math.round(mode === 'serving' ? qty * food.gramsPerUnit : qty),
      calories: Math.round(food.calories * multiplier),
      protein: Number((food.protein * multiplier).toFixed(1)),
      carbs: Number((food.carbs * multiplier).toFixed(1)),
      fats: Number((food.fats * multiplier).toFixed(1)),
      fiber: Number((food.fiber * multiplier).toFixed(1)),
      sugar: Number(((food.sugar || 0) * multiplier).toFixed(1)),
      sodium: Math.round((food.sodium || 0) * multiplier),
      date: selectedDate,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setNutritionLogs((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newEntry]
    }));

    setSelectedFood(null);
    setQuantity('1');
    triggerToast(`🍽️ Added ${food.name} (${newEntry.calories} kcal • ${newEntry.protein}g P)`);
  };

  const handleRemoveEntry = (id: string) => {
    setNutritionLogs((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] || []).filter((e) => e.id !== id)
    }));
    triggerToast('🗑️ Food entry removed');
  };

  const handleCopyYesterday = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const yesterdayStr = d.toISOString().split('T')[0];
    const yesterdayItems = nutritionLogs[yesterdayStr] || [];

    if (yesterdayItems.length === 0) {
      triggerToast('⚠️ No meals found on previous day to copy.');
      return;
    }

    const cloned = yesterdayItems.map((item) => ({
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: selectedDate
    }));

    setNutritionLogs((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), ...cloned]
    }));

    triggerToast(`📋 Copied ${cloned.length} items from ${yesterdayStr}!`);
  };

  const handleSaveSlotAsTemplate = (slot: MealSlot) => {
    const slotItems = dayEntries.filter((e) => e.mealSlot === slot);
    if (slotItems.length === 0) {
      triggerToast(`⚠️ Log foods in ${slot} first to save a combo template.`);
      return;
    }

    const templateName = `${slot} Combo (${slotItems.length} items)`;
    const newTemplate: SavedMealTemplate = {
      id: `meal_${Date.now()}`,
      name: templateName,
      items: slotItems.map((i) => ({
        foodId: i.foodId,
        foodName: i.foodName,
        quantity: i.quantity,
        unitMode: i.unitMode
      }))
    };

    setSavedMeals((prev) => [newTemplate, ...prev]);
    triggerToast(`⭐ Saved "${templateName}" to Quick Combos!`);
  };

  const handleApplySavedMeal = (template: SavedMealTemplate) => {
    let addedCount = 0;
    const newEntries: LoggedFoodEntry[] = [];

    template.items.forEach((tItem) => {
      const food = allFoods.find((f) => f.id === tItem.foodId);
      if (!food) return;
      const multiplier =
        tItem.unitMode === 'serving'
          ? tItem.quantity
          : tItem.quantity / (food.gramsPerUnit || 100);

      newEntries.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        foodId: food.id,
        foodName: food.name,
        mealSlot: activeSlot,
        quantity: tItem.quantity,
        unitMode: tItem.unitMode,
        servingLabel:
          tItem.unitMode === 'serving'
            ? `${tItem.quantity} × ${food.servingLabel}`
            : `${tItem.quantity}g`,
        gramsTotal: Math.round(
          tItem.unitMode === 'serving' ? tItem.quantity * food.gramsPerUnit : tItem.quantity
        ),
        calories: Math.round(food.calories * multiplier),
        protein: Number((food.protein * multiplier).toFixed(1)),
        carbs: Number((food.carbs * multiplier).toFixed(1)),
        fats: Number((food.fats * multiplier).toFixed(1)),
        fiber: Number((food.fiber * multiplier).toFixed(1)),
        sugar: Number(((food.sugar || 0) * multiplier).toFixed(1)),
        sodium: Math.round((food.sodium || 0) * multiplier),
        date: selectedDate,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      addedCount++;
    });

    if (addedCount > 0) {
      setNutritionLogs((prev) => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), ...newEntries]
      }));
      triggerToast(`⚡ Logged ${template.name} into ${activeSlot}!`);
    }
  };

  const handleCreateCustomFood = () => {
    if (!customName.trim() || !customCals) {
      triggerToast('⚠️ Please enter food name and calories.');
      return;
    }

    const newFood: FoodItem = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      category: 'Custom',
      servingUnit: 'piece',
      servingLabel: customServingLabel || '1 serving (100g)',
      gramsPerUnit: Number(customGrams) || 100,
      calories: Number(customCals) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fats: Number(customFats) || 0,
      fiber: Number(customFiber) || 0,
      sugar: 0,
      sodium: 50,
      isVeg: true,
      isCustom: true
    };

    setCustomFoods((prev) => [newFood, ...prev]);
    setShowCustomModal(false);
    setCustomName('');
    setCustomCals('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFats('');
    triggerToast(`✅ Custom food "${newFood.name}" created!`);
  };

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Smart Nutrition Coaching Insight
  const nutritionInsight = useMemo(() => {
    const proteinRemaining = Math.max(0, Math.round(targets.protein - dayTotals.protein));
    const calsRemaining = Math.round(targets.calories - dayTotals.calories);
    const fiberRemaining = Math.max(0, Math.round(targets.fiber - dayTotals.fiber));

    if (dayEntries.length === 0) {
      return {
        type: 'info',
        title: 'Start Your Daily Fuel Log',
        message: `Target for ${profile?.goal || 'Muscle Gain'}: ${targets.calories} kcal & ${targets.protein}g protein. Select a meal slot below and log your South Indian or high-protein staples.`
      };
    }

    if (proteinRemaining > 35 && calsRemaining < 400 && calsRemaining > -200) {
      return {
        type: 'warning',
        title: `Protein Gap Detected (${proteinRemaining}g Remaining)`,
        message: `Your calories are nearly full (${dayTotals.calories}/${targets.calories} kcal), but you still need ${proteinRemaining}g protein. Prioritize lean protein like Egg Whites, Whey Scoop, Grilled Chicken Breast, or Soya Chunks.`
      };
    }

    if (calsRemaining < -250) {
      return {
        type: 'alert',
        title: `Calorie Surplus (+${Math.abs(calsRemaining)} kcal Over Target)`,
        message: `You have exceeded your daily target of ${targets.calories} kcal. Add 2,500 extra steps today and keep dinner light with Rasam, Poriyal, and lean protein.`
      };
    }

    if (proteinRemaining === 0 && Math.abs(calsRemaining) <= 250) {
      return {
        type: 'success',
        title: 'Anabolic Macro Target Hit! 🏆',
        message: `Outstanding discipline! You hit ${dayTotals.protein.toFixed(0)}g protein and ${dayTotals.calories} kcal.`
      };
    }

    return {
      type: 'info',
      title: `Remaining Today: ${Math.max(0, calsRemaining)} kcal • ${proteinRemaining}g Protein`,
      message:
        fiberRemaining > 12
          ? `Tip: Add 1 bowl Sambar, Sundal, or Guava to close your ${fiberRemaining}g fiber gap.`
          : `Tip: Pair Idli/Dosa with 3 Boiled Eggs or Soya Chunks to hit your protein target effortlessly.`
    };
  }, [dayEntries, dayTotals, targets, profile]);

  const calPct = Math.min(100, Math.round((dayTotals.calories / targets.calories) * 100));
  const proPct = Math.min(100, Math.round((dayTotals.protein / targets.protein) * 100));
  const carbPct = Math.min(100, Math.round((dayTotals.carbs / targets.carbs) * 100));
  const fatPct = Math.min(100, Math.round((dayTotals.fats / targets.fats) * 100));
  const fibPct = Math.min(100, Math.round((dayTotals.fiber / targets.fiber) * 100));

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      {/* Header & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--card)] border border-[var(--border)] p-5 rounded-3xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shrink-0">
            <Utensils size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Nutrition & Diet Engine</h2>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/25">
                South Indian + Global DB
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest mt-0.5">
              Goal: {profile?.goal || 'Muscle Gain'} • TDEE {targets.tdee} kcal • BMR {targets.bmr} kcal
            </p>
          </div>
        </div>

        {/* Date Navigation & Copy Yesterday */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2.5 rounded-xl bg-[var(--sub)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            title="Previous Day"
          >
            <ChevronLeft size={16} />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value || todayStr)}
            className="bg-[var(--sub)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider text-white outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={() => shiftDate(1)}
            className="p-2.5 rounded-xl bg-[var(--sub)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
            title="Next Day"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={handleCopyYesterday}
            className="px-3 py-2.5 rounded-xl bg-[var(--sub)] border border-[var(--border)] hover:border-[var(--accent)] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
            title="Copy Yesterday's Meals"
          >
            <Copy size={13} className="text-[var(--accent)]" />
            <span className="hidden md:inline">Copy Yesterday</span>
          </button>
        </div>
      </div>

      {/* Macro Summary Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Calorie & Protein Ring Card */}
        <div className="lg:col-span-5 bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Daily Energy Budget</span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white tabular-nums mt-0.5">
                {dayTotals.calories} <span className="text-base font-bold text-[var(--muted)]">/ {targets.calories} kcal</span>
              </div>
            </div>
            <div className="text-right">
              <span className={cn(
                "px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border",
                dayTotals.calories > targets.calories + 200
                  ? "bg-red-500/15 text-red-400 border-red-500/30"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              )}>
                {targets.calories - dayTotals.calories >= 0
                  ? `${targets.calories - dayTotals.calories} kcal left`
                  : `${Math.abs(targets.calories - dayTotals.calories)} kcal over`}
              </span>
            </div>
          </div>

          <div className="w-full h-3 bg-[var(--sub)] rounded-full overflow-hidden border border-[var(--border)] mb-4">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent)] to-amber-500 transition-all duration-500"
              style={{ width: `${calPct}%` }}
            />
          </div>

          {/* Micronutrients & Secondary Bar */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border)] text-center">
            <div className="p-2 rounded-xl bg-[var(--sub)]">
              <div className="text-[9px] font-black uppercase text-[var(--muted)]">Fiber</div>
              <div className="text-xs font-black text-emerald-400 mt-0.5">
                {dayTotals.fiber.toFixed(1)}g / {targets.fiber}g
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[var(--sub)]">
              <div className="text-[9px] font-black uppercase text-[var(--muted)]">Sugar</div>
              <div className="text-xs font-black text-amber-400 mt-0.5">
                {dayTotals.sugar.toFixed(1)}g
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[var(--sub)]">
              <div className="text-[9px] font-black uppercase text-[var(--muted)]">Sodium</div>
              <div className="text-xs font-black text-blue-400 mt-0.5">
                {dayTotals.sodium} mg
              </div>
            </div>
          </div>
        </div>

        {/* 4 Macro Progress Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Protein */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Protein</span>
              <Beef size={16} className="text-red-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-white tabular-nums">{dayTotals.protein.toFixed(0)}g</div>
              <div className="text-[10px] text-[var(--muted)] font-bold">Target: {targets.protein}g</div>
            </div>
            <div className="h-2 bg-[var(--sub)] rounded-full overflow-hidden">
              <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${proPct}%` }} />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Carbs</span>
              <Wheat size={16} className="text-amber-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-white tabular-nums">{dayTotals.carbs.toFixed(0)}g</div>
              <div className="text-[10px] text-[var(--muted)] font-bold">Target: {targets.carbs}g</div>
            </div>
            <div className="h-2 bg-[var(--sub)] rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${carbPct}%` }} />
            </div>
          </div>

          {/* Fats */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Fats</span>
              <Droplet size={16} className="text-blue-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-white tabular-nums">{dayTotals.fats.toFixed(0)}g</div>
              <div className="text-[10px] text-[var(--muted)] font-bold">Target: {targets.fats}g</div>
            </div>
            <div className="h-2 bg-[var(--sub)] rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${fatPct}%` }} />
            </div>
          </div>

          {/* Fiber */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Fiber</span>
              <Flame size={16} className="text-emerald-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-white tabular-nums">{dayTotals.fiber.toFixed(1)}g</div>
              <div className="text-[10px] text-[var(--muted)] font-bold">Target: {targets.fiber}g</div>
            </div>
            <div className="h-2 bg-[var(--sub)] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${fibPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Intelligent Coach Feedback Banner */}
      <div className={cn(
        "p-4 rounded-2xl border flex items-start gap-3",
        nutritionInsight.type === 'warning'
          ? "bg-amber-500/10 border-amber-500/30"
          : nutritionInsight.type === 'alert'
          ? "bg-red-500/10 border-red-500/30"
          : nutritionInsight.type === 'success'
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-[var(--card)] border-[var(--border)]"
      )}>
        <Sparkles size={18} className="text-[var(--accent)] shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-white">{nutritionInsight.title}</div>
          <p className="text-xs text-white/80 mt-0.5 leading-relaxed">{nutritionInsight.message}</p>
        </div>
      </div>

      {/* Meal Slot Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {MEAL_SLOTS.map((slot) => {
          const slotCals = dayEntries
            .filter((e) => e.mealSlot === slot)
            .reduce((s, e) => s + e.calories, 0);
          const isActive = activeSlot === slot;
          return (
            <button
              key={slot}
              onClick={() => setActiveSlot(slot)}
              className={cn(
                "px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0 flex items-center gap-2",
                isActive
                  ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg shadow-[var(--accent)]/20"
                  : "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-white"
              )}
            >
              <span>{slot}</span>
              {slotCals > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[10px]",
                  isActive ? "bg-black/30 text-white" : "bg-[var(--sub)] text-[var(--accent)]"
                )}>
                  {slotCals} kcal
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Split Grid: Left = Food Search & Quick Add, Right = Logged Meals by Slot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Search & Food Database */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Search size={16} className="text-[var(--accent)]" />
                Add Food to <span className="text-[var(--accent)]">{activeSlot}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVegOnly(!vegOnly)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                    vegOnly
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-[var(--sub)] text-[var(--muted)] border-[var(--border)]"
                  )}
                >
                  🌱 Veg Only
                </button>
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-[var(--accent)] hover:text-white transition-all"
                >
                  <Plus size={12} /> Custom Food
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Idli, Dosa, Sambar, Pongal, Chicken Biryani, Eggs, Whey, Paneer..."
                className="w-full pl-10 pr-9 py-3 rounded-2xl bg-[var(--sub)] border border-[var(--border)] text-sm text-white placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0",
                    selectedCategory === cat
                      ? "bg-white text-black border-white"
                      : "bg-[var(--sub)] text-[var(--muted)] border-[var(--border)] hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Frequent / Recent Quick Chips */}
            {recentFoodIds.length > 0 && !searchQuery && (
              <div className="pt-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-2 flex items-center gap-1">
                  <History size={11} /> Frequently Logged (1-Tap Add)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentFoodIds.map((id) => {
                    const food = allFoods.find((f) => f.id === id);
                    if (!food) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => handleLogFood(food, 1, 'serving')}
                        className="px-2.5 py-1.5 rounded-xl bg-[var(--sub)] hover:bg-[var(--accent)]/15 border border-[var(--border)] hover:border-[var(--accent)]/40 text-[10px] font-bold text-white flex items-center gap-1.5 transition-all"
                      >
                        <span>+ {food.name}</span>
                        <span className="text-[var(--accent)] font-black">{food.calories}cal</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Food Portion Customizer Drawer */}
            {selectedFood && previewMacros && (
              <div className="p-4 rounded-2xl bg-[var(--accent)]/10 border-2 border-[var(--accent)] space-y-3 animate-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">
                      Configure Portion • {selectedFood.category}
                    </span>
                    <h4 className="text-base font-black text-white">{selectedFood.name}</h4>
                    <p className="text-[11px] text-[var(--muted)]">Base: {selectedFood.servingLabel}</p>
                  </div>
                  <button
                    onClick={() => setSelectedFood(null)}
                    className="p-1.5 rounded-lg bg-black/30 text-[var(--muted)] hover:text-white"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Mode Switcher: Serving vs Grams */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setUnitMode('serving');
                      setQuantity('1');
                    }}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all",
                      unitMode === 'serving'
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-black/40 text-[var(--muted)] border-[var(--border)]"
                    )}
                  >
                    By {selectedFood.servingUnit} ({selectedFood.gramsPerUnit}g)
                  </button>
                  <button
                    onClick={() => {
                      setUnitMode('grams');
                      setQuantity(String(selectedFood.gramsPerUnit || 100));
                    }}
                    className={cn(
                      "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1",
                      unitMode === 'grams'
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-black/40 text-[var(--muted)] border-[var(--border)]"
                    )}
                  >
                    <Scale size={12} /> By Grams (g)
                  </button>
                </div>

                {/* Quick Multipliers & Input */}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0.25"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-24 px-3 py-2 rounded-xl bg-black/50 border border-[var(--border)] text-base font-black text-white outline-none focus:border-[var(--accent)]"
                  />
                  {unitMode === 'serving' ? (
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setQuantity(String(n))}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-black border transition-all",
                            Number(quantity) === n
                              ? "bg-white text-black border-white"
                              : "bg-black/40 text-white border-[var(--border)]"
                          )}
                        >
                          {n}x
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {[50, 100, 150, 200, 300].map((g) => (
                        <button
                          key={g}
                          onClick={() => setQuantity(String(g))}
                          className={cn(
                            "px-2.5 py-2 rounded-xl text-xs font-black border transition-all",
                            Number(quantity) === g
                              ? "bg-white text-black border-white"
                              : "bg-black/40 text-white border-[var(--border)]"
                          )}
                        >
                          {g}g
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live Macro Calculation Preview */}
                <div className="grid grid-cols-5 gap-2 p-2.5 rounded-xl bg-black/40 text-center">
                  <div>
                    <div className="text-[9px] text-[var(--muted)] font-bold uppercase">Calories</div>
                    <div className="text-sm font-black text-white">{previewMacros.calories}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-red-400 font-bold uppercase">Protein</div>
                    <div className="text-sm font-black text-red-400">{previewMacros.protein}g</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-amber-400 font-bold uppercase">Carbs</div>
                    <div className="text-sm font-black text-amber-400">{previewMacros.carbs}g</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-blue-400 font-bold uppercase">Fats</div>
                    <div className="text-sm font-black text-blue-400">{previewMacros.fats}g</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-emerald-400 font-bold uppercase">Fiber</div>
                    <div className="text-sm font-black text-emerald-400">{previewMacros.fiber}g</div>
                  </div>
                </div>

                <button
                  onClick={() => handleLogFood(selectedFood, parseFloat(quantity) || 1, unitMode)}
                  className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-black text-xs uppercase tracking-widest shadow-lg hover:brightness-110 transition-all"
                >
                  + Log to {activeSlot} ({previewMacros.gramsTotal}g)
                </button>
              </div>
            )}

            {/* Food List */}
            <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  onClick={() => {
                    setSelectedFood(food);
                    setUnitMode('serving');
                    setQuantity('1');
                  }}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                    selectedFood?.id === food.id
                      ? "bg-[var(--accent)]/15 border-[var(--accent)]"
                      : "bg-[var(--sub)] border-[var(--border)] hover:border-white/20"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          food.isVeg === false ? "bg-red-500" : "bg-emerald-500"
                        )}
                      />
                      <span className="text-xs sm:text-sm font-black text-white truncate">{food.name}</span>
                    </div>
                    <div className="text-[10px] text-[var(--muted)] font-semibold mt-0.5">
                      {food.servingLabel} • <span className="text-red-400 font-bold">{food.protein}g P</span> •{' '}
                      <span className="text-amber-400">{food.carbs}g C</span> •{' '}
                      <span className="text-blue-400">{food.fats}g F</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-black text-white tabular-nums">{food.calories}</div>
                      <div className="text-[9px] text-[var(--muted)] uppercase font-bold">kcal</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogFood(food, 1, 'serving');
                      }}
                      className="p-2 rounded-xl bg-[var(--accent)]/15 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white border border-[var(--accent)]/30 transition-all"
                      title="Quick Add 1 Serving"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Meal Templates */}
          {savedMeals.length > 0 && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-1.5">
                <Bookmark size={14} className="text-[var(--accent)]" /> Saved Meal Combos
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {savedMeals.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-3 rounded-2xl bg-[var(--sub)] border border-[var(--border)] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">{tpl.name}</div>
                      <div className="text-[10px] text-[var(--muted)] truncate">
                        {tpl.items.map((i) => i.foodName).join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleApplySavedMeal(tpl)}
                      className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-wider shrink-0"
                    >
                      Log
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Daily Meal Log Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {MEAL_SLOTS.map((slot) => {
            const items = dayEntries.filter((e) => e.mealSlot === slot);
            const slotCals = items.reduce((s, e) => s + e.calories, 0);
            const slotPro = items.reduce((s, e) => s + e.protein, 0);

            return (
              <div
                key={slot}
                onClick={() => setActiveSlot(slot)}
                className={cn(
                  "bg-[var(--card)] border rounded-3xl p-4 transition-all cursor-pointer",
                  activeSlot === slot ? "border-[var(--accent)] shadow-md" : "border-[var(--border)]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-white">{slot}</span>
                    {activeSlot === slot && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)]">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[var(--muted)]">
                      {slotCals} kcal • <span className="text-red-400">{slotPro.toFixed(0)}g P</span>
                    </span>
                    {items.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveSlotAsTemplate(slot);
                        }}
                        className="p-1.5 rounded-lg bg-[var(--sub)] hover:text-[var(--accent)] text-[var(--muted)]"
                        title="Save as Meal Template"
                      >
                        <Bookmark size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {items.length === 0 ? (
                  <p className="text-[11px] text-[var(--muted)] italic py-1">
                    No food logged for {slot}. Tap to select and add items.
                  </p>
                ) : (
                  <div className="space-y-2 mt-2 pt-2 border-t border-[var(--border)]">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--sub)]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">{item.foodName}</div>
                          <div className="text-[10px] text-[var(--muted)]">
                            {item.servingLabel} • {item.protein}g P • {item.carbs}g C • {item.fats}g F
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-white tabular-nums">{item.calories} kcal</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveEntry(item.id);
                            }}
                            className="p-1.5 text-[var(--muted)] hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Custom Food Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-[800] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-wider">Create Custom Food</h3>
              <button onClick={() => setShowCustomModal(false)} className="p-1 text-[var(--muted)] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Food Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Mom's Chicken Kuzhambu"
                  className="w-full mt-1 p-3 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-sm text-white outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Serving Label</label>
                  <input
                    type="text"
                    value={customServingLabel}
                    onChange={(e) => setCustomServingLabel(e.target.value)}
                    placeholder="1 bowl (150g)"
                    className="w-full mt-1 p-2.5 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Grams / Serving</label>
                  <input
                    type="number"
                    value={customGrams}
                    onChange={(e) => setCustomGrams(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Calories (kcal)</label>
                  <input
                    type="number"
                    value={customCals}
                    onChange={(e) => setCustomCals(e.target.value)}
                    placeholder="220"
                    className="w-full mt-1 p-2.5 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-red-400">Protein (g)</label>
                  <input
                    type="number"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    placeholder="18"
                    className="w-full mt-1 p-2.5 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-amber-400">Carbs (g)</label>
                  <input
                    type="number"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    placeholder="12"
                    className="w-full mt-1 p-2.5 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-blue-400">Fats (g)</label>
                  <input
                    type="number"
                    value={customFats}
                    onChange={(e) => setCustomFats(e.target.value)}
                    placeholder="9"
                    className="w-full mt-1 p-2.5 rounded-xl bg-[var(--sub)] border border-[var(--border)] text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="flex-1 py-3 rounded-xl bg-[var(--sub)] text-xs font-black uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomFood}
                className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-white text-xs font-black uppercase"
              >
                Save Food
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
