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
│   ├── calendar/       # DayCard, DayDetailModal, MonthView, TotalsDisplay
│   ├── chat/           # ChatHistory, ChatMessage, OllamaModelControl, agent-action-cards/
│   ├── cook/           # VoiceIndicator
│   ├── ingredients/    # CreateIngredientModal
│   ├── meals/          # MealCard, CreateMealModal, MealIngredientSelector
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
│   ├── meals/          # Meal types, constants, shared-meal types, mock data
│   ├── ollama/         # Ollama service, action types, prompts, schemas
│   └── shoppingList/   # Shopping list types, mock data
├── routes/             # Router config (AppRoutes, ProtectedRoutes)
├── screens/            # Page-level components
│   ├── Auth.tsx, VerifyEmail.tsx        # Authentication
│   ├── Chat.tsx                         # AI chat interface
│   ├── Ingredients.tsx, IngredientDetail.tsx, IngredientBarcodeEntry.tsx
│   ├── Meals.tsx, MealDetail.tsx, MealFromText.tsx, MealFromUrl.tsx
│   ├── CookMode.tsx                     # Step-by-step cooking
│   ├── CalendarScreen.tsx               # Meal planner
│   ├── ShoppingList.tsx                 # Shopping list
│   ├── SharedMealView.tsx               # Public shared recipe view
│   ├── Home.tsx, About.tsx, Account.tsx
│   └── NotFound.tsx, ErrorFallback.tsx
├── store/              # Redux Toolkit state management
│   ├── index.ts        # Store configuration
│   ├── hooks.ts        # Typed hooks (useAppDispatch, useAppSelector)
│   ├── actions/        # Async Firestore thunks (calendar, chat, ingredient, meal, shoppingList, shareMeal)
│   ├── api/            # External API clients (Open Food Facts)
│   └── slices/         # Redux slices (calendar, chats, demo, ingredients, meals, shoppingList, user)
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

## Features

### 🎭 Demo Mode
- Try the app without an account — pre-loaded mock data for all features
- Session-scoped persistence via `sessionStorage`; amber banner indicates demo status
- All CRUD thunks handle demo mode internally — components never branch on demo state

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

### 🍽️ AI Meal & Ingredient Creation
- Create meals via chat with intent confirmation and 5-step generation (name → info → description → ingredients → instructions)
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

### 🍽️ Meals
- Card-based recipe browser with search, category/time filters
- Full CRUD with image upload, dynamic ingredient list, and interactive instruction steps
- **Cook Mode**: immersive step-by-step cooking with progress bar, ingredient drawer, voice navigation ("Hey Demi"), and responsive layout
- Create from manual entry, pasted text (AI-parsed), or URL

### 📅 Meal Planner
- Day, week, and custom range views with date navigation
- Plan meals by category with quick-add buttons and inline edit/remove
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

### Meal

```typescript
interface Meal {
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
  ingredients: MealIngredient[];
}

interface MealIngredient {
  ingredientId: string;
  servings: number;
}

interface PlannedMeal {
  id: string;
  userId: string;
  mealId: string;
  date: number;
  category: MealCategory;
  notes: string | null;
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
| `mealsSlice` | Meal recipe collection CRUD |
| `chatsSlice` | Chat conversations and messages |
| `calendarSlice` | Planned meals / meal planner |
| `shoppingListSlice` | Shopping list items |
| `userSlice` | Authentication state |
| `demoSlice` | Demo mode session management |

All Firestore async thunks read the user from Redux state (never accept `userId` as a parameter) and use the `condition` option to skip execution when demo mode is active.
