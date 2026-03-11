# Demmi

A cooking app powered with local LLM using Ollama.

## Features

### 🎭 Demo Mode
- **Try Before You Sign Up**: A subtle "Try Demo Mode" link below the auth form lets curious users explore the app without an account
- **Full App Access**: Demo mode bypasses authentication and gives access to all tabs (Chat, Meals, Ingredients, Calendar)
- **Pre-loaded Mock Data**: Chats, meals, ingredients, calendar, and shopping list are populated with realistic demo content on launch
- **Dynamic Calendar Data**: Calendar demo data is always generated relative to the current day — yesterday, today, tomorrow, and the day after are auto-populated with planned meals so it always looks accurate
- **Persistent Demo Banner**: An amber banner is always visible at the top of the screen while in demo mode, clearly indicating preview status ("🎭 Demo Mode — changes won't be saved")
- **Exit Demo**: Both the top banner and the sidebar provide an "Exit Demo" button that clears demo data and returns to the auth page
- **Session-Scoped Persistence**: Demo mode is persisted in `sessionStorage`, so refreshing keeps demo mode active for the current browser session
- **No Auth Flicker on Refresh**: Protected routes wait for demo session hydration before redirect checks, preventing auth-page flashes when demo mode is active
- **Redux-Powered**: Demo state is managed via a dedicated `demoSlice` with async thunks (`initializeDemoSession`, `startDemoSession`, `endDemoSession`, `loadDemoData`, `clearDemoData`) for clean data loading and teardown. All CRUD async thunks (`mealActions`, `ingredientActions`, `calendarActions`, `shoppingListActions`, `chatActions`) handle demo mode internally — no component needs to branch on demo state for CRUD operations.

### 🔐 Authentication & Security
- **Email Authentication**: Secure sign up and login using Firebase Authentication
- **Google Authentication**: One-click sign in with Google via Firebase Authentication
- **Email Verification**: Required email verification for new accounts
- **Auto Verification Check**: Refresh-safe verification status checks with automatic redirect
- **Protected Routes**: Automatic redirection to auth screen for unauthenticated users (demo mode bypasses this)
- **Session Management**: Persistent authentication state across page reloads
- **Password Requirements**: Minimum 6 characters for secure accounts
- **Auth Form UI**: Beautiful authentication interface using Dreamer UI's AuthForm component
- **Verification Flow**: Dedicated email verification screen with resend functionality
- **Seamless UX**: Automatic navigation after successful authentication

### 💬 Chat
- **Copy Message**: A 📋 button appears on hover for any message (user or assistant) — clicking it copies the trimmed message content to the clipboard
- **Edit & Re-send**: A ✏️ button appears on hover for user messages — clicking it loads the message into the input for editing; if there is already unsent text in the input a confirmation dialog prevents accidental loss; upon sending, the original message and all subsequent messages are replaced with the re-generated conversation
- **Edit Mode Indicator**: A contextual banner above the input shows when a message is being edited and provides a one-click cancel to dismiss the edit without losing the chat history
- **Local LLM via Ollama**: Connects to [Ollama](https://ollama.com) running on your machine (localhost:11434) for fully private, offline AI responses
- **Model Selection**: Dropdown in the chat header lists all text models available in your local Ollama installation — pick any model on the fly; selector is disabled while a response is streaming
- **Auto-download Mistral**: If no text models are installed, a "Download Mistral" button appears. Clicking it streams the pull progress (status text + animated progress bar with percentage) directly in the header until the model is ready
- **Streaming Responses**: Assistant replies stream token-by-token in real time, just like a native chat app — no waiting for the full response
- **Markdown Rendering**: Agent responses are rendered as rich Markdown — headings, bold/italic text, inline code, code blocks, lists, and more are all formatted for readability
- **Streaming Cursor**: A blinking cursor shows while the assistant is typing; a bouncing dots indicator appears before the first token arrives
- **Cancel Response**: A cancel button (✕) appears next to the send button while a response is streaming — clicking it immediately interrupts the generation and keeps the partial response visible
- **Message Details Toggle**: "Show details / Hide details" button in the header reveals the timestamp and the model name below each message
- **Per-message Model Tracking**: Each assistant message stores which Ollama model generated it, shown as a monospace badge when details are visible
- **Meal-Focused System Prompt**: The assistant is instructed to focus on cooking, recipes, meal planning, ingredients, and nutrition
- **Ollama Status Indicator**: The model selector shows "Connecting to Ollama..." on load, "⚠️ Ollama offline" if the service is unreachable, and falls back gracefully with an error message in chat
- **Full Conversation Context**: Each request sends the full conversation history so the assistant can reference earlier messages
- **AI Chat Interface**: Modern ChatGPT-style interface for cooking assistance
- **Message Bubbles**: User messages (orange) and assistant responses (gray) with distinct styling
- **Chat History**: Collapsible sidebar showing all conversations
- **Header Sidebar Toggle**: History toggle icon in the chat header for quick access
- **Pinned Chats**: Pin important conversations to keep them at the top
- **New Chat**: Start fresh conversations with a single click
- **Auto-scroll**: Messages automatically scroll into view
- **Empty State**: Beautiful prompt for new conversations
- **Keyboard Support**: Enter to send, Shift+Enter for new lines
- **Embedded Send Button**: Discreet send action inside the message input — disabled until a model is selected
- **Message Count**: Shows number of messages in each conversation
- **Delete Chats**: Remove conversations from history
- **Responsive Design**: Works seamlessly on mobile and desktop

### 🍳 Cooking-Themed Design
- **Orange Accent Color**: Warm, cooking-inspired orange accent color throughout the app
- **Modern & Clean**: Simple black and white base with orange highlights
- **Light & Dark Modes**: Full support for both themes with automatic color adjustments
- **Demmi Brand Logo**: Demeter-inspired wheat emblem displayed in the app navigation

### � Home Page
- **Hero Section**: Eye-catching landing experience featuring the Demmi logo and gradient title
- **Feature Showcase**: Six key features displayed in an organized grid with emojis and descriptions
- **Multiple CTAs**: Prominent "Get Started" and "Try Demo Mode" buttons for clear user action paths
- **Three-Section Layout**: Hero introduction, feature highlights, and final call-to-action for optimal conversion flow
- **Responsive Design**: Fully responsive layout that adapts from mobile to desktop with smooth transitions
- **Brand Integration**: Wheat emblem logo prominently displayed with orange accent gradient branding
- **Feature Highlights**:
  - 💬 AI Chat Assistant
  - 🍽️ Recipe Management
  - 🍎 Ingredient Tracking
  - 📅 Meal Planning
  - 🛒 Shopping Lists
  - 🎭 Demo Mode Access

### 📖 About Page
- **Origin Story**: Personal narrative about the frustration with disconnected AI threads (ChatGPT, etc.)
- **The Thread Problem**: Explains how isolated AI conversations lack mutual connection and actionable context
- **Cooking-Specific Pain Points**: 
  - AI can't see your kitchen inventory
  - No memory of previous meal discussions
  - Suggestions aren't based on what you actually have
  - No connection to pricing, nutrition, or planning
- **Connected Context Solution**: How Demmi ties everything together
  - AI has access to your ingredient inventory
  - Conversations connect to saved meals and recipes
  - Pricing and nutrition are calculated, not estimated
  - Calendar, shopping lists, and meal planning all integrated
- **Local AI Philosophy**: Why Ollama matters
  - Privacy: data never leaves your device
  - Control: no subscriptions, no usage limits
  - Independence: works offline, no cloud dependency
- **Comparison Table**: Generic AI tools vs. Demmi across Context, Actionability, Privacy, and Integration
- **Accessible from Home**: "Learn More" button in final CTA section links to About page
- **Responsive Layout**: Optimized reading experience with clear sections and compelling narrative

### 🎨 Navigation
- **Sidebar Navigation**: ChatGPT-style sidebar with intuitive navigation
  - **Chat**: AI-powered cooking assistant
  - **Ingredients**: Manage your ingredients
  - **Meals**: Browse and manage meal recipes
  - **Calendar**: Schedule your cooking
  - **Shopping List**: Manage your grocery list
  - **Account**: User settings and profile
- **Theme Toggle**: Switch component for seamless light/dark mode switching
- **Mobile Responsive**: Collapsible sidebar with hamburger menu on mobile devices

### 🍎 Ingredients
- **Ingredient Cards**: Beautiful card-based layout displaying ingredient inventory
  - Reusable ingredient cards for consistent display
  - Clickable cards that navigate to detailed view
  - Cover Images: Each ingredient features an attractive cover image
  - Type Badges: Color-coded badges with unique colors for each ingredient type (fully visible in both light and dark modes)
  - Type Emojis: Visual indicators for quick ingredient type identification (🥩 🥬 🥛 🌾 🫘 🫒 🧂 🥜 🐟 📦)
- **Ingredient Types**: Organized by `meat`, `produce`, `dairy`, `grains`, `legumes`, `oils`, `spices`, `nuts`, `seafood`, and `other`
- **Search Functionality**: Search ingredients by name in real-time
- **Filter by Type**: Dropdown filter to show only specific ingredient types
- **Out of Stock Toggle**: Switch to view only ingredients that are out of stock
- **Sort Options**: Sort ingredients by name or servings in both ascending and descending order
- **Detailed Ingredient View**: Full-screen dedicated view for creating and editing ingredients
  - **Create Ingredients**: Navigate to `/ingredients/new` to add new ingredients
  - **Edit Ingredients**: Click on any ingredient card to edit it with pre-populated form data
  - **Back to Ingredients**: Quick link to return to the ingredients list from the detail view
  - **Delete Ingredients**: Delete button on detailed view with confirmation dialog
  - **File Upload**: Upload ingredient images with live preview
  - Form includes: name, type, current amount, serving size, unit (with custom unit support), price per unit, image upload, and comprehensive nutrient profile
- **Inventory Details**:
  - Ingredient name and type
  - Servings available based on serving size
  - Serving size per ingredient (aligned to unit)
  - Current amount in inventory
  - Price per unit
- **Comprehensive Nutrition Profile** (per 100g/100ml):
  - **Macronutrients**: Protein (g), Carbohydrates (g), Fat (g)
  - **Additional Nutrients**: Calories (kcal), Fiber (g), Sugar (g), Sodium (mg)
- **Measurement Units**: Support for 21 different units including weight (lb, oz, kg, g), volume (cup, tbsp, tsp, gallon), and packaging (can, bag, bottle, jar, etc.), plus custom units
- **Responsive Grid**: Adapts from 1 column (mobile) to 3 columns (desktop)
- **Mock Data**: 12 sample ingredients across all types, including out-of-stock examples
- **User-Centric Content**: Displays your ingredient inventory with personalized messaging

### 🍽️ Meals
- **Meal Cards**: Beautiful card-based layout displaying meal recipes
  - Reusable MealCard component for consistent display
  - Clickable cards that navigate to detailed view
  - Cover Images: Each meal features an attractive cover image
  - Category Badges: Color-coded badges with unique colors for each category (fully visible in both light and dark modes)
  - Category Emojis: Visual indicators for quick meal type identification
  - Recipe Details: Title, description, prep time, cook time, serving size, total cooking time, and step-by-step instructions count
- **Search Functionality**: Search recipes by name or description in real-time
- **Filter by Category**: Dropdown filter to show only specific meal types (`breakfast`, `lunch`, `dinner`, `snack`, `dessert`, `drink`)
- **Filter by Total Time**: Dropdown filter to show meals by total cooking time (prep + cook time: `under-15`, `15-30`, `30-60`, `over-60`)
- **No Prep Time Toggle**: Filter switch to show only meals that require no preparation time
- **Detailed Meal View**: Full-screen dedicated view for creating and editing meals
  - **Create Meals**: Navigate to `/meals/new` to add new meals
  - **Edit Meals**: Click on any meal card to edit it with pre-populated form data
  - **Back to Meals**: Quick link to return to the meals list from the detail view
  - **Delete Meals**: Delete button on detailed view with confirmation dialog
  - **File Upload**: Upload meal images with live preview
  - **Dynamic Instructions**: Use DynamicList component for adding, reordering, and removing instruction steps (editing controls available only in edit mode)
  - **Dynamic Ingredient List**: Use DynamicList to add ingredients from your inventory, set quantity/unit per ingredient, remove entries, and reorder ingredient rows while editing a meal
  - **Ingredient Row Display**: Each ingredient row displays in recipe format (e.g. "2 cups flour") with an Edit action
  - **Ingredient Modal Entry**: Adding or editing an ingredient opens a modal with ingredient, quantity, and unit fields (unit is fully editable to allow custom units per meal)
  - **Create Ingredients Inline**: Jump directly to `/ingredients/new` from meal editing and return with the new ingredient ready to add
  - Form includes: title, description, category, prep time, cook time, servings, image upload, dynamic ingredient list, and interactive instructions list
- **Cloud Persistence**: All meal changes are synced to Firestore for signed-in users
  - **Create**: New meals are stored in Firestore under the authenticated user's account
  - **Update**: Edits are persisted to Firestore with ownership verification (only the owner can update)
  - **Delete**: Deletions are persisted to Firestore with ownership verification (only the owner can delete)
  - **Error Toasts**: Toast notifications alert the user if any Firestore operation fails
- **Demo Mode Isolation**: When demo mode is active, all meal changes update in-memory state only — nothing is written to Firestore. This is handled transparently inside the async thunks, so components always dispatch a single action regardless of demo state.
- **Responsive Grid**: Adapts from 1 column (mobile) to 3 columns (desktop)
- **Mock Data**: 8 sample meals across all categories for demonstration
- **User-Centric Content**: Displays your meal recipes with personalized messaging

### 📱 Mobile-First Design
- Fully responsive sidebar that adapts to screen size
- Mobile detection hook for responsive UI behavior
- Touch-friendly interface with smooth animations
- Optimized for both desktop and mobile experiences
- Viewport-locked app shell: page-level scroll is disabled and scrolling is constrained to the main content area to keep key UI (like chat input and demo banner) stable on screen

### 📅 Meal Planner (Calendar)
- **Day View**: Browse and manage meals planned for a single day with full date details
- **Week View**: Compact 7-day grid showing the entire week at a glance (Monday–Sunday)
- **Custom Range View**: Pick any start and end date to view a custom planning period
- **Date Navigation**: Previous/Next buttons to move between days or weeks
- **Plan a Meal**: Modal form to assign any meal to a date with category and optional notes
- **Edit & Remove**: Inline controls on each planned meal for quick updates or removal
- **Category Organization**: Meals grouped by category (🌅 Breakfast, 🍱 Lunch, 🌙 Dinner, 🍿 Snack, 🍰 Dessert, 🥤 Drink)
- **Quick-Add Buttons**: Per-category "+" shortcuts on each day card for fast meal planning
- **Nutrition Totals**: Automatic calculation across the selected period:
  - 🔥 Total Calories (kcal)
  - 💰 Estimated Total Price ($)
  - 💪 Total Protein (g)
  - 🌾 Total Carbohydrates (g)
  - 🥑 Total Fat (g)
  - 🥦 Total Fiber (g)
- **Price Calculation**: Uses the default product per ingredient; falls back to the first listed product when no default is set
- **Ingredient-Based Nutrition**: Totals derive from the ingredient composition of each planned meal
- **Cloud Persistence**: All planned meal changes are synced to Firestore for signed-in users
  - **Fetch**: Planned meals are loaded from Firestore on demand via `fetchPlannedMeals`
  - **Create**: New planned meals are stored in Firestore under the authenticated user's account
  - **Update**: Edits are persisted to Firestore with ownership verification (only the owner can update)
  - **Delete**: Removals are persisted to Firestore with ownership verification (only the owner can delete)
  - **Error Toasts**: Toast notifications alert the user if any Firestore operation fails
- **Demo Mode Isolation**: When demo mode is active, all planned meal changes update in-memory state only — nothing is written to Firestore. This is handled transparently inside the async thunks, so components always dispatch a single action regardless of demo state.

### 🛒 Shopping List
- **Grouped by Category**: Items are automatically grouped and displayed by category (🥩 Meat, 🐟 Seafood, 🥬 Produce, 🥛 Dairy, 🌾 Grains, 🫘 Legumes, 🥜 Nuts, 🫒 Oils, 🧂 Spices, 📦 Other)
- **Two Item Types**:
  - **Simple Text**: Add any free-text item (e.g. "Dish soap") to the list
  - **Ingredient-Linked**: Link an item to a stored ingredient and optionally to a specific product/retailer
- **Amount & Unit**: Optionally specify a quantity and unit (lb, oz, kg, g, cup, tbsp, tsp, piece, ml, l, other) per item
- **Notes**: Attach a free-text note to any item (e.g. "Organic if possible")
- **Check Off Items**: Tap the checkbox to tick off items as you shop; checked items dim to reduce visual noise
- **Progress Bar**: A live progress bar in the header shows how many items have been checked off
- **Show/Hide Checked**: Toggle to hide already-checked items and focus on what's left
- **Clear Checked**: Remove all checked items at once with a single confirmation
- **Edit & Delete**: Inline Edit and Delete actions on each item row
- **Auto-fill from Ingredient**: Selecting a stored ingredient auto-fills the item name, category, and default unit
- **Mock Data**: 9 sample shopping list items across all categories for demonstration
- **Redux-Powered**: All state managed in a dedicated `shoppingListSlice` with actions: `addShoppingListItem`, `updateShoppingListItem`, `toggleShoppingListItem`, `deleteShoppingListItem`, `clearCheckedItems`, `setShoppingList`, `resetShoppingList`
- **Firestore CRUD**: Full Firestore persistence for authenticated users via async thunks in `shoppingListActions.ts` (`fetchShoppingList`, `createShoppingListItem`, `updateShoppingListItem`, `deleteShoppingListItem`, `clearCheckedShoppingListItems`)
- **Demo-Aware**: All mutations handle demo mode transparently inside the async thunks — demo sessions update local Redux state only, authenticated sessions persist to Firestore with toast error feedback. Components always dispatch the same single action regardless of demo state.

## Tech Stack

- [React 19](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [TailwindCSS 4](https://tailwindcss.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [React Redux](https://react-redux.js.org/) - React bindings for Redux
- [Dreamer UI](https://www.npmjs.com/package/@moondreamsdev/dreamer-ui) - Component library
- [Firebase](https://firebase.google.com/) - Authentication and backend services
- [Ollama](https://ollama.com/) - Local LLM runtime for AI chat
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown rendering for agent responses
- [Vite](https://vite.dev/) - Build tool

## Design & Visual Aesthetic

### Color Palette
- **Accent**: Orange (orange-500 light, orange-400 dark) - Warm, cooking-inspired
- **Success**: Emerald green
- **Warning**: Amber
- **Destructive**: Red
- **Background**: Slate-100 (light), Slate-900 (dark)
- **Foreground**: Slate-900 (light), Slate-100 (dark)

### Components
Built with [Dreamer UI](https://www.npmjs.com/package/@moondreamsdev/dreamer-ui):
- Toggle switch for theme control
- Avatar component for user account
- Responsive sidebar navigation
- Card and layout components
- Badge components for categorization

## State Management

Demmi uses **Redux Toolkit** for centralized state management across the application. All application state is managed through Redux slices with type-safe actions and reducers.

### Redux Store Structure

The Redux store is organized into five main slices:

1. **Ingredients Slice** (`ingredientsSlice.ts`)
   - Manages ingredient inventory
   - Sync Actions: `setIngredients`, `resetIngredients` (and internal: `createIngredient`, `updateIngredient`, `deleteIngredient` used only by demo data loading)
   - Async Thunks (demo + signed-in mode): `fetchIngredients`, `createIngredient`, `updateIngredient`, `deleteIngredient` (from `ingredientActions.ts`) — each thunk automatically handles demo mode internally, skipping Firestore and updating local state only when demo is active
   - State: Array of ingredients with full CRUD support (each ingredient includes a `userId` field and an embedded `products` array for pricing)

2. **Meals Slice** (`mealsSlice.ts`)
   - Manages meal recipes collection
   - Sync Actions: `setMeals`, `resetMeals` (and internal: `createMeal`, `updateMeal`, `deleteMeal` used only by demo data loading)
   - Async Thunks (demo + signed-in mode): `fetchMeals`, `createMeal`, `updateMeal`, `deleteMeal` (from `mealActions.ts`) — each thunk automatically handles demo mode internally, skipping Firestore and updating local state only when demo is active
   - State: Array of meals with full CRUD support (each meal includes a `userId` field and an `ingredients` array for nutrition/price calculations)

3. **Chats Slice** (`chatsSlice.ts`)
   - Manages chat conversations and messages
   - Actions: `setCurrentChat`, `createConversation`, `addMessage`, `updateConversation`, `deleteConversation`, `togglePinConversation`
   - State: Array of conversations and current chat ID

4. **User Slice** (`userSlice.ts`)
   - Manages user authentication state
   - Actions: `setUser`, `setLoading`, `clearUser`
   - State: User object and loading status

5. **Calendar Slice** (`calendarSlice.ts`)
   - Manages the meal planner / calendar feature
   - Actions: `addPlannedMeal`, `updatePlannedMeal`, `removePlannedMeal`, `setPlannedMeals`, `resetCalendar`
   - Async thunks: `fetchPlannedMeals`, `createPlannedMeal`, `updatePlannedMeal`, `deletePlannedMeal` (in `calendarActions.ts`)
   - State: Array of planned meal entries (each entry links a `Meal` to a date, category, and optional notes)

### Usage

The app provides typed Redux hooks for type-safe state access:

```typescript
import { useAppDispatch, useAppSelector } from '@store/hooks';

// In a component
const dispatch = useAppDispatch();
const meals = useAppSelector((state) => state.meals.items);

// Dispatch actions
dispatch(createMeal(newMealData));
dispatch(updateMeal({ id: mealId, updates: mealData }));
dispatch(deleteMeal(mealId));
```

### Benefits

- **Centralized State**: All app state in one predictable location
- **Type Safety**: Full TypeScript support with typed actions and selectors
- **DevTools Integration**: Redux DevTools for debugging and time-travel debugging
- **Immutable Updates**: Redux Toolkit uses Immer for safe, mutable-style state updates
- **Persistence Ready**: Easy to integrate with redux-persist for state persistence

## Data Schema

### Chat Interfaces
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number; // milliseconds timestamp
}

interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  isPinned: boolean;
  lastUpdated: number; // milliseconds timestamp
  userId: string;      // owner's Firebase Auth uid
}
```

### Ingredient Interface
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
  // Macros (per 100g/100ml)
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  // Additional nutrients
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // milligrams
  calories: number; // kcal
}

interface Ingredient {
  id: string;
  name: string;
  type: IngredientType;
  imageUrl: string;
  nutrients: NutrientProfile;
  currentAmount: number;
  servingSize: number; // portion size in the same unit as `unit`
  unit: MeasurementUnit;
  otherUnit: string | null;
  pricePerUnit: number; // in dollars
}
```

### Meal Interface
```typescript
interface Meal {
  id: string;
  userId: string;      // owner's Firebase Auth uid
  title: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drink';
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servingSize: number;
  instructions: string[];
  imageUrl: string;
  ingredients: MealIngredient[]; // ingredient quantities used in this meal
}

interface MealIngredient {
  ingredientId: string; // references an Ingredient
  servings: number;     // number of ingredient servings used
}

interface PlannedMeal {
  id: string;
  userId: string;       // Firebase Auth UID of the owner
  mealId: string;       // references a Meal
  date: number;         // start-of-day timestamp (ms)
  category: MealCategory;
  notes: string | null;
}
```

## Setup & Configuration

### Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard
  - Enable Email/Password and Google authentication in Authentication settings

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration values:
   ```bash
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

3. **Enable Email Verification**
   - In Firebase Console, go to Authentication > Templates
   - Customize the email verification template (optional)

### Ollama Setup

Demmi's Chat feature requires [Ollama](https://ollama.com) running locally.

1. **Install Ollama** — Download from [ollama.com](https://ollama.com/download)

2. **Pull at least one model**, for example:
   ```bash
   ollama pull llama3.2
   ```

3. **Start Ollama** (it usually starts automatically):
   ```bash
   ollama serve
   ```
   Ollama listens on `http://localhost:11434` by default.

4. Open the **Chat** tab in Demmi — available models will appear in the dropdown in the header. Select a model and start chatting.

> **Note:** If Ollama is not running, the model selector shows "⚠️ Ollama offline" and chat is disabled. Responses stream token-by-token directly from your local machine — no data leaves your computer.

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ChatHistory.tsx      # Chat sidebar navigation
│   ├── ChatMessage.tsx      # Message bubble component
│   ├── MealCard.tsx         # Meal card display component (clickable)
│   ├── MealIngredientSelector.tsx # Ingredient picker for meal create/edit
│   ├── ProtectedRoute.tsx   # Route protection wrapper
│   └── Sidebar.tsx          # Main app sidebar
├── contexts/         # React context providers
│   └── AuthContext.tsx      # Authentication context provider
├── hooks/            # Custom React hooks
│   ├── useAuth.tsx          # Authentication hook
│   └── useIsMobileDevice.ts # Device detection hook
├── lib/              # Utilities and data
│   ├── app/           # App constants
│   ├── chat/          # Chat types and mock data
│   ├── firebase/      # Firebase configuration and services
│   ├── ingredients/   # Ingredient types and mock data
│   └── meals/         # Meal types and mock data
├── routes/           # Router configuration
├── screens/          # Page components
│   ├── About.tsx            # About/manifesto page
│   ├── Auth.tsx             # Authentication screen
│   ├── Chat.tsx             # AI chat interface
│   ├── IngredientDetail.tsx # Detailed ingredient view for create/edit
│   ├── Ingredients.tsx      # Ingredient inventory screen
│   ├── MealDetail.tsx       # Detailed meal view for create/edit
│   ├── Meals.tsx            # Meal browsing screen with search/filters
│   ├── VerifyEmail.tsx      # Email verification screen
│   └── ...
├── store/            # Redux state management
│   ├── index.ts       # Store configuration
│   ├── hooks.ts       # Typed Redux hooks (useAppDispatch, useAppSelector)
│   ├── actions/       # Async Firestore thunks
│   │   ├── chatActions.ts      # Chat Firestore CRUD thunks
│   │   └── mealActions.ts      # Meal Firestore CRUD thunks
│   └── slices/        # Redux slices
│       ├── chatsSlice.ts       # Chat conversations state
│       ├── ingredientsSlice.ts # Ingredients inventory state
│       ├── mealsSlice.ts       # Meals collection state
│       └── userSlice.ts        # User authentication state
└── ui/               # Layout components
    ├── Layout.tsx     # App shell layout
    ├── Loading.tsx    # Loading state UI
    └── ThemeToggle.tsx # Theme switcher
```

