# Demmi

A cooking app powered with local LLM using Ollama.

## Features

### 🎭 Demo Mode
- **Try Before You Sign Up**: A subtle "Try Demo Mode" link below the auth form lets curious users explore the app without an account
- **Full App Access**: Demo mode bypasses authentication and gives access to all tabs (Chat, Meals, Ingredients, Calendar)
- **Pre-loaded Mock Data**: Chats, meals, and ingredients are populated with realistic demo content on launch
- **Dynamic Calendar Data**: Calendar demo data is always generated relative to the current day — yesterday, today, tomorrow, and the day after are auto-populated with planned meals so it always looks accurate
- **Persistent Demo Banner**: An amber banner is always visible at the top of the screen while in demo mode, clearly indicating preview status ("🎭 Demo Mode — changes won't be saved")
- **Exit Demo**: Both the top banner and the sidebar provide an "Exit Demo" button that clears demo data and returns to the auth page
- **Session-Scoped Persistence**: Demo mode is persisted in `sessionStorage`, so refreshing keeps demo mode active for the current browser session
- **No Auth Flicker on Refresh**: Protected routes wait for demo session hydration before redirect checks, preventing auth-page flashes when demo mode is active
- **Redux-Powered**: Demo state is managed via a dedicated `demoSlice` with async thunks (`initializeDemoSession`, `startDemoSession`, `endDemoSession`, `loadDemoData`, `clearDemoData`) for clean data loading and teardown

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
- **AI Chat Interface**: Modern ChatGPT-style interface for cooking assistance
- **Organized AI Workflow**: Use a local LLM to converse, create meals, and edit ingredients with minimal friction
- **Message Bubbles**: User messages (orange) and assistant responses (gray) with distinct styling
- **Chat History**: Collapsible sidebar showing all conversations
- **Header Sidebar Toggle**: History toggle icon in the chat header for quick access
- **Pinned Chats**: Pin important conversations to keep them at the top
- **New Chat**: Start fresh conversations with a single click
- **Mock AI Responses**: Context-aware responses based on keywords (recipe, ingredient, meal prep)
- **Auto-scroll**: Messages automatically scroll into view
- **Typing Indicator**: Animated loading state while waiting for responses
- **Empty State**: Beautiful prompt for new conversations
- **Keyboard Support**: Enter to send, Shift+Enter for new lines
- **Embedded Send Button**: Discreet send action inside the message input
- **Message Count**: Shows number of messages in each conversation
- **Delete Chats**: Remove conversations from history
- **Responsive Design**: Works seamlessly on mobile and desktop

### 🍳 Cooking-Themed Design
- **Orange Accent Color**: Warm, cooking-inspired orange accent color throughout the app
- **Modern & Clean**: Simple black and white base with orange highlights
- **Light & Dark Modes**: Full support for both themes with automatic color adjustments
- **Demmi Brand Logo**: Demeter-inspired wheat emblem displayed in the app navigation

### 🎨 Navigation
- **Sidebar Navigation**: ChatGPT-style sidebar with intuitive navigation
  - **Chat**: AI-powered cooking assistant
  - **Ingredients**: Manage your ingredients
  - **Meals**: Browse and manage meal recipes
  - **Calendar**: Schedule your cooking
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

## Tech Stack

- [React 19](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [TailwindCSS 4](https://tailwindcss.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [React Redux](https://react-redux.js.org/) - React bindings for Redux
- [Dreamer UI](https://www.npmjs.com/package/@moondreamsdev/dreamer-ui) - Component library
- [Firebase](https://firebase.google.com/) - Authentication and backend services
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
   - Actions: `createIngredient`, `updateIngredient`, `deleteIngredient`
   - State: Array of ingredients with full CRUD support

2. **Meals Slice** (`mealsSlice.ts`)
   - Manages meal recipes collection
   - Actions: `createMeal`, `updateMeal`, `deleteMeal`
   - State: Array of meals with full CRUD support (each meal includes an `ingredients` array for nutrition/price calculations)

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
   - Actions: `addPlannedMeal`, `updatePlannedMeal`, `removePlannedMeal`
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

