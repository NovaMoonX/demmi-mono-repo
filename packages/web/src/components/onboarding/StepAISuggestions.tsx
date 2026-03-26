import { useState, useEffect, useRef } from 'react';
import { Button, Badge } from '@moondreamsdev/dreamer-ui/components';
import { useAppDispatch } from '@store/hooks';
import { createRecipe } from '@store/actions/recipeActions';
import { listLocalModels, ollamaClient } from '@lib/ollama';
import type { RecipeCategory } from '@lib/recipes';
import type { StepProps } from './types';

interface SuggestedRecipe {
  title: string;
  category: RecipeCategory;
  description: string;
}

const FALLBACK_RECIPES: SuggestedRecipe[] = [
  {
    title: 'Classic Pasta Bolognese',
    category: 'dinner',
    description: 'A hearty Italian meat sauce served over spaghetti.',
  },
  {
    title: 'Overnight Oats',
    category: 'breakfast',
    description: 'Creamy oats prepared the night before with your choice of toppings.',
  },
  {
    title: 'Vegetable Stir Fry',
    category: 'lunch',
    description: 'Quick and colorful mixed vegetables in a savory sauce.',
  },
];

const SUGGESTION_SCHEMA = {
  type: 'object',
  required: ['recipes'],
  properties: {
    recipes: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'category', 'description'],
        properties: {
          title: { type: 'string' },
          category: {
            type: 'string',
            enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
          },
          description: { type: 'string' },
        },
      },
    },
  },
};

const CATEGORY_EMOJI: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
  dessert: '🍰',
  drink: '🥤',
};

export function StepAISuggestions({ formData, next, skip }: StepProps) {
  const dispatch = useAppDispatch();
  const [recipes, setRecipes] = useState<SuggestedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const initialFormData = useRef(formData);

  useEffect(() => {
    let cancelled = false;
    const data = initialFormData.current;

    async function generateSuggestions() {
      try {
        const models = await listLocalModels();
        if (!cancelled && models.length === 0) {
          setRecipes(FALLBACK_RECIPES);
          setIsLoading(false);
          return;
        }

        const model = models[0];
        const goals = (data.cookingGoal ?? []).join(', ') || 'general cooking';
        const dietary = (data.dietaryRestrictions ?? []).join(', ') || 'none';
        const cuisines = (data.cuisinePreferences ?? []).join(', ') || 'any';
        const skill = data.skillLevel ?? 'intermediate';
        const cookTime = data.cookTimePreference ?? 'any';

        const response = await ollamaClient.chat({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are a recipe suggestion assistant. Suggest 3 recipes that match the user profile. Return valid JSON only.',
            },
            {
              role: 'user',
              content: `Cooking goals: ${goals}\nDietary restrictions: ${dietary}\nCuisine preferences: ${cuisines}\nSkill level: ${skill}\nCook time preference: ${cookTime}\n\nSuggest 3 recipes.`,
            },
          ],
          stream: false,
          format: SUGGESTION_SCHEMA,
        });

        if (cancelled) return;

        const parsed = JSON.parse(response.message.content);
        const suggested: SuggestedRecipe[] = Array.isArray(parsed.recipes)
          ? parsed.recipes.slice(0, 3)
          : FALLBACK_RECIPES;

        setRecipes(suggested.length > 0 ? suggested : FALLBACK_RECIPES);
      } catch {
        if (!cancelled) {
          setRecipes(FALLBACK_RECIPES);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    generateSuggestions();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await Promise.all(
      recipes.map((r) =>
        dispatch(
          createRecipe({
            title: r.title,
            description: r.description,
            category: r.category,
            cuisine: 'american',
            prepTime: 0,
            cookTime: 30,
            servingSize: 2,
            instructions: [],
            imageUrl: '',
            ingredients: [],
            share: null,
          }),
        ),
      ),
    );
    next();
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h2 className='text-foreground text-2xl font-bold'>Here are 3 recipes we think you'll love</h2>
      </div>

      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='bg-muted h-20 animate-pulse rounded-xl'
              aria-label='Loading recipe'
            />
          ))}
        </div>
      ) : (
        <div className='space-y-3'>
          {recipes.map((recipe, idx) => (
            <div
              key={idx}
              className='bg-background border-border flex items-start gap-3 rounded-xl border p-4'
            >
              <span className='text-xl' aria-hidden>
                {CATEGORY_EMOJI[recipe.category] ?? '🍽️'}
              </span>
              <div className='min-w-0 flex-1'>
                <p className='text-foreground text-sm font-semibold'>{recipe.title}</p>
                <p className='text-muted-foreground mt-0.5 text-xs'>{recipe.description}</p>
              </div>
              <Badge variant='secondary' outline>{recipe.category}</Badge>
            </div>
          ))}
        </div>
      )}

      <div className='flex items-center gap-3 pt-2'>
        <Button variant='primary' onClick={handleSave} disabled={isLoading || isSaving} type='button'>
          {isSaving ? 'Saving…' : 'Save these recipes'}
        </Button>
        <Button variant='tertiary' onClick={skip} disabled={isSaving} type='button'>
          Skip
        </Button>
      </div>
    </div>
  );
}
