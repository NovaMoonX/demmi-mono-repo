# @demmi/web

The React web application for **Demmi** — a cooking app powered by a local LLM via Ollama.

> For project overview, target audience, and consumer-facing information, see the [root README](../../README.md).

## Quick Start

### From the monorepo root

```bash
npm install
npm -w @demmi/web run dev
```

### From within this package

```bash
cd packages/web
npm run dev
```

The dev server starts at `http://localhost:5173` (with `--host` for LAN access / QR code).

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with `--host` |
| `npm run build` | Type-check with `tsc` then build with Vite |
| `npm run lint` | Run ESLint across the project |
| `npm run test` | Run Vitest test suite |
| `npm run test:ui` | Open Vitest UI in browser |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run preview` | Preview the production build locally |
| `npm run fbdeploy` | Build and deploy to Firebase Hosting |

## Environment Variables

Create a `.env` file in this package directory with your Firebase config:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password** and **Google** sign-in under Authentication
3. Enable **Realtime Database** (Build → Realtime Database → Create Database)
4. Copy your web app config values into the `.env` file above
5. Deploy security rules:
   ```bash
   firebase deploy --only database
   firebase deploy --only firestore:rules
   ```
6. Optionally customize the email verification template under Authentication → Templates

## Ollama Setup

The Chat feature requires [Ollama](https://ollama.com) running locally.

1. Install from [ollama.com/download](https://ollama.com/download)
2. Pull a model:
   ```bash
   ollama pull llama3.2
   ```
3. Start the server (usually auto-starts on install):
   ```bash
   ollama serve
   ```
   Ollama listens on `http://localhost:11434`. The Chat tab auto-detects available models. If Ollama is offline, the UI shows a warning and chat is disabled.

> **Privacy:** All LLM inference runs locally — no data leaves your machine.

## Project Structure

```
src/
├── components/         # Reusable UI components (organized by feature)
│   ├── account/        # ProfileViewMode, ProfileEditForm
│   ├── calendar/       # DayCard, DayDetailModal, MonthView, TotalsDisplay
│   ├── chat/           # ChatHistory, ChatMessage, OllamaModelControl, agent-action-cards/
│   ├── cook/           # VoiceIndicator
│   ├── ingredients/    # CreateIngredientModal
│   ├── recipes/          # RecipeCard, CreateRecipeModal, RecipeIngredientSelector
│   ├── shopping/       # ItemRow, ItemFormModal, shoppingUtils
│   └── Sidebar.tsx
├── contexts/           # React context providers (AuthContext)
├── hooks/              # Custom hooks (useAuth, useOllamaModels, useCookModeVoice, useIsMobileDevice)
├── lib/                # Domain logic, types, constants, and utilities per feature
│   ├── app/            # App-wide constants
│   ├── calendar/       # Calendar types, utils, mock data
│   ├── chat/           # Chat types, mock data
│   ├── firebase/       # Firebase config and auth service
│   ├── ingredients/    # Ingredient types, constants, utils, mock data
│   ├── recipes/          # Recipe types, constants, shared-recipe types, mock data
│   ├── ollama/         # Ollama service, action types, prompts, schemas
│   └── shoppingList/   # Shopping list types, mock data
│   └── userProfile/    # UserProfile types, constants, mock data
├── routes/             # Router config (AppRoutes, ProtectedRoutes)
├── screens/            # Page-level components
│   ├── Auth.tsx, VerifyEmail.tsx        # Authentication
│   ├── Chat.tsx                         # AI chat interface
│   ├── Ingredients.tsx, IngredientDetail.tsx, IngredientBarcodeEntry.tsx
│   ├── Recipes.tsx, RecipeDetail.tsx, RecipeFromText.tsx, RecipeFromUrl.tsx
│   ├── CookMode.tsx                     # Step-by-step cooking
│   ├── CalendarScreen.tsx               # Meal planner
│   ├── ShoppingList.tsx                 # Shopping list
│   ├── SharedRecipeView.tsx               # Public shared recipe view
│   ├── Home.tsx, About.tsx, Account.tsx
│   └── NotFound.tsx, ErrorFallback.tsx
├── store/              # Redux Toolkit state management
│   ├── index.ts        # Store configuration
│   ├── hooks.ts        # Typed hooks (useAppDispatch, useAppSelector)
│   ├── actions/        # Async Firestore thunks (calendar, chat, ingredient, recipe, shoppingList, shareRecipe, userProfile)
│   ├── api/            # External API clients (Open Food Facts)
│   └── slices/         # Redux slices (calendar, chats, demo, ingredients, recipes, shoppingList, user, userProfile)
├── ui/                 # Layout components (Layout, Loading)
└── utils/              # Shared utilities (generatedId, capitalize, formatDate, barcodePrefill)
```

## Tech Stack

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) ~5.9 | Type safety |
| [TailwindCSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Centralized state management |
| [Firebase](https://firebase.google.com/) | Auth, Firestore, Realtime DB, Hosting, Storage |
| [Vite](https://vite.dev/) 7 | Dev server and bundler |
| [Ollama](https://ollama.com/) | Local LLM runtime for AI chat |
| [Dreamer UI](https://www.npmjs.com/package/@moondreamsdev/dreamer-ui) | Component library |
| [React Router](https://reactrouter.com/) 7 | Client-side routing |
| [React Markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering for AI responses |
| [Vitest](https://vitest.dev/) | Testing framework |
| [@testing-library/react](https://testing-library.com/) | Component testing utilities |

## Testing

Tests are co-located with source files (e.g., `capitalize.test.ts` next to `capitalize.ts`).
Uses **Vitest** with `globals: false` — every test file imports `describe`, `it`, `expect`, `vi` from `'vitest'`.

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # Open Vitest UI in browser
```

**Test structure:**
- `src/utils/*.test.ts` — Utility function tests
- `src/lib/**/*.test.ts` — Domain logic tests (calendar utils, ingredient utils)
- `src/store/slices/*.test.ts` — Redux slice reducer tests
- `src/store/actions/*.test.ts` — Async thunk action tests
- `src/hooks/*.test.ts` — Custom hook tests
- `src/components/**/*.test.tsx` — Component tests
- `src/screens/*.test.tsx` — Screen integration tests (with mocked child components)
- `src/__tests__/helpers/` — Shared test utilities (`renderWithProviders`)
- `src/__tests__/mocks/` — Mocks for Firebase, Dreamer UI components/hooks/utils/providers/symbols
- `vitest.config.ts` — Vitest configuration (aliases, environment, setup)

## Features

### 🎭 Demo Mode
- Try the app without an account — pre-loaded mock data for all features including a demo user profile
- Session-scoped persistence via `sessionStorage`; amber banner indicates demo status
- All CRUD thunks handle demo mode internally — components never branch on demo state

### 👤 Account & User Profile
- View and edit dietary restrictions (predefined + custom "Other" freeform input), avoid ingredients (freeform chips), and cuisine preferences
- Cooking goal selection with descriptive cards, household size, skill level, and cook time preference via segmented controls
- Auto pantry deduction toggle — automatically updates pantry when shopping list items are checked off
- Reset onboarding shortcut navigates back to `/onboarding`
- Read-only view mode by default; switches to edit form on demand
- Skeleton loading state and fallback callout when profile is unavailable

### 🔐 Authentication & Security
- Email/password and Google sign-in via Firebase Authentication
- Email verification required; protected routes redirect unauthenticated users
- Centralized auth data loading hydrates all user collections on sign-in

### 💬 AI Chat
- Local LLM via Ollama with model selection, auto-download, and offline detection
- Streaming token-by-token responses with cancel support and Markdown rendering
- Structured JSON format for machine-parseable responses with action cards
- Copy, edit & re-send messages; pinned chats; conversation history sidebar
- Summary-based intent detection using last 10 message summaries for efficient context
- Modular action registry — add new AI actions without touching the chat component

### 🍽️ AI Recipe & Ingredient Creation
- Create recipes via chat with intent confirmation and 5-step generation (name → info → description → ingredients → instructions)
- Preview cards show new vs. existing ingredients, duplicate detection, and post-save shopping list prompt
- Decline, iterate, or approve — the AI never modifies your collection without explicit confirmation

### 🔗 Recipe Sharing
- Share recipes via unique links; public view at `/shared/:shareId` without login
- Copy link, refresh shared content, or stop sharing — secured by Firebase Realtime DB rules

### 🍎 Ingredients
- Card-based inventory with search, type filter, out-of-stock toggle, and sort options
- Barcode support with Open Food Facts API lookup for auto-fill (name, image, serving, nutrients)
- Comprehensive nutrition profile (calories, protein, carbs, fat, fiber, sugar, sodium per 100g/100ml)
- 21 measurement units including custom units

### 🍽️ Recipes
- Card-based recipe browser with search, category/time filters
- Full CRUD with image upload, dynamic ingredient list, and interactive instruction steps
- **Cook Mode**: immersive step-by-step cooking with progress bar, ingredient drawer, voice navigation ("Hey Demi"), and responsive layout
- Create from manual entry, pasted text (AI-parsed), or URL

### 📅 Meal Planner
- Day, week, and custom range views with date navigation
- Plan recipes by category with quick-add buttons and inline edit/remove
- Automatic nutrition and price totals across the selected period

### 🛒 Shopping List
- Items grouped by category; supports free-text and ingredient-linked items
- Check-off with progress bar, show/hide checked, clear checked, edit & delete
- Amount, unit, and notes per item

### 📱 Mobile-First Design
- Fully responsive sidebar, touch-friendly interface
- Viewport-locked app shell with content-area scrolling

## Data Schema

### Chat

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model: string | null;
  rawContent: string | null;
  agentAction: AgentAction | null;
  summary: string | null;
}

interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  isPinned: boolean;
  lastUpdated: number;
  userId: string;
}
```

### Ingredient

```typescript
type IngredientType =
  | 'meat'
  | 'produce'
  | 'dairy'
  | 'grains'
  | 'legumes'
  | 'oils'
  | 'spices'
  | 'nuts'
  | 'seafood'
  | 'other';

type MeasurementUnit =
  | 'lb'
  | 'oz'
  | 'kg'
  | 'g'
  | 'cup'
  | 'tbsp'
  | 'tsp'
  | 'piece'
  | 'can'
  | 'bag';

interface NutrientProfile {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  calories: number;
}

interface Ingredient {
  id: string;
  name: string;
  type: IngredientType;
  imageUrl: string;
  nutrients: NutrientProfile;
  currentAmount: number;
  servingSize: number;
  unit: MeasurementUnit;
  otherUnit: string | null;
  pricePerUnit: number;
}
```

### Recipe

```typescript
interface Recipe {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink';
  prepTime: number;
  cookTime: number;
  servingSize: number;
  instructions: string[];
  imageUrl: string;
  ingredients: RecipeIngredient[];
}

interface RecipeIngredient {
  ingredientId: string;
  servings: number;
}
```

### PlannedRecipe / Calendar

```typescript
interface PlannedRecipe {
  id: string;
  userId: string;
  recipeId: string;
  date: number;
  category: RecipeCategory;
  notes: string | null;
}
```

### UserProfile

Stored at `/userProfiles/{uid}` in Firestore. The document key is the Firebase Auth UID.

```typescript
type DietaryRestriction =
  | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free'
  | 'halal' | 'kosher' | 'nut-free' | 'no-restrictions'
  | (string & {});

type CookingGoal =
  | 'eat-healthier' | 'lose-weight' | 'save-money' | 'save-time'
  | 'reduce-waste' | 'track-macros' | 'meal-prep'
  | 'explore-cuisines' | 'learn-cooking';

type CookingSkillLevel = 'beginner' | 'intermediate' | 'advanced';
type CookTimePreference = 'under-20' | '30-min' | 'any';
type WeightUnit = 'kg' | 'lbs';

interface CookingGoalDetails {
  'lose-weight': { currentWeight: number; goalWeight: number; weightUnit: WeightUnit } | null;
  'track-macros': { protein: number; carbs: number; fat: number } | null;
  'save-money': { weeklyBudget: number } | null;
  'save-time': { maxCookMinutes: number } | null;
  'reduce-waste': { trackLeftovers: boolean } | null;
  'meal-prep': { daysAhead: number } | null;
}

interface UserProfile {
  userId: string;
  displayName: string | null;
  dietaryRestrictions: DietaryRestriction[];
  customDietaryRestrictions: string[];
  avoidIngredients: string[];
  cuisinePreferences: RecipeCuisineType[];
  cookingGoal: CookingGoal | null;
  cookingGoalDetails: CookingGoalDetails | null;
  householdSize: number;
  skillLevel: CookingSkillLevel | null;
  cookTimePreference: CookTimePreference | null;
  lovedMealDescription: string | null;
  dislikedMealDescription: string | null;
  autoPantryDeduct: boolean | null;
  createdAt: number;
  updatedAt: number;
  onboardingCompletedAt: number | null;
}
```

## Design & Visual Aesthetic

### Color Palette

| Role | Light | Dark |
|---|---|---|
| Accent | `orange-500` | `orange-400` |
| Success | Emerald green | Emerald green |
| Warning | Amber | Amber |
| Destructive | Red | Red |
| Background | `slate-100` | `slate-900` |
| Foreground | `slate-900` | `slate-100` |

- Light and dark mode fully supported with automatic color adjustments
- Built with [Dreamer UI](https://www.npmjs.com/package/@moondreamsdev/dreamer-ui) components: toggle, avatar, sidebar, cards, badges, and more

## State Management

Redux Toolkit with typed hooks (`useAppDispatch`, `useAppSelector`). The store is organized into slices:

| Slice | Purpose |
|---|---|
| `ingredientsSlice` | Ingredient inventory CRUD |
| `recipesSlice` | Recipe collection CRUD |
| `chatsSlice` | Chat conversations and messages |
| `calendarSlice` | Planned recipes / meal planner |
| `shoppingListSlice` | Shopping list items |
| `userSlice` | Authentication state |
| `demoSlice` | Demo mode session management |
| `userProfileSlice` | User profile (dietary, preferences, goals) |

All Firestore async thunks read the user from Redux state (never accept `userId` as a parameter) and use the `condition` option to skip execution when demo mode is active.
