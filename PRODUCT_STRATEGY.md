# Demmi — Product Strategy & Launch Readiness Plan

> **Status:** Working Draft · March 2026
> **Purpose:** Align on app goal, target users, feature audit, what to build or cut, business model, onboarding, design polish, and a 2–3 week sprint plan before rolling Demmi out to real customers.

---

## 1. The Core Goal

**Demmi's goal is to be the most personal, frictionless, and private meal-planning companion for home cooks.**

Generic AI tools (ChatGPT, Google, etc.) don't know what's in your kitchen, what you prefer to eat, or what you cooked last week. Every session starts from scratch. Demmi fixes this by connecting your ingredient inventory, saved recipes, meal calendar, and shopping list into a single persistent, AI-aware workspace — one that gets smarter and more useful the more you use it.

In a single sentence:
> **Demmi helps you decide what to cook, guides you through cooking it, and makes sure you always have what you need — privately and persistently.**

---

> **Naming Note:** Throughout this document, **Demmi** refers to the product/app, while **Demi** refers to the AI assistant persona embedded within the app (the voice you talk to in chat and Cook Mode). The two-letter distinction is intentional and important for branding.

---

## 2. Target Users

### 2.1 Primary: The "Google-Cook"

**Profile:** Someone who currently Googles "easy chicken dinner ideas" or pastes a question into ChatGPT, but has no persistent record of what they've made, what they like, or what's in their fridge.

**Pain points:**
- Repeats the same recipe research every week
- ChatGPT doesn't remember their allergies, preferences, or pantry
- No connection between the recipe they found and their grocery trip
- Ends up buying ingredients they already have (or can't use before they expire)

**What Demmi offers them:**
- A persistent AI that already knows their inventory, past recipes, and meal history
- One-tap shopping list from any recipe or meal plan
- Local AI that never forgets context between sessions

### 2.2 Secondary: The Health-Conscious Tracker

**Profile:** Someone actively monitoring nutrition — calories, macros, fiber, sodium — who finds manually logging food in spreadsheets or third-party apps tedious.

**Pain points:**
- Nutrition data scattered across apps, labels, and websites
- Hard to track nutrition across a full week of planned meals
- No tool ties ingredient-level data to recipe-level totals to calendar-level weekly summaries

**What Demmi offers them:**
- Ingredient-level nutrient profiles (calories, protein, carbs, fat, fiber, sugar, sodium)
- Automatic weekly nutrition totals in the calendar
- Barcode scan for instant nutrient import from Open Food Facts

### 2.3 Secondary: The Privacy-First User

**Profile:** Someone uncomfortable sending their personal dietary habits, health data, and daily routines to cloud AI services.

**Pain points:**
- Doesn't want ChatGPT, Google, or any SaaS vendor storing their meal data
- Has experimented with local LLMs but has no cohesive app built around them

**What Demmi offers them:**
- Fully local LLM via Ollama — zero AI data leaves the device
- Firebase only stores recipe/ingredient/calendar data (no AI conversation content sent externally)
- Electron desktop app for a fully offline-capable experience

### 2.4 Secondary: The Busy Family Organizer

**Profile:** Someone planning meals for 3–5 people, coordinating grocery runs, and trying to reduce food waste.

**Pain points:**
- Meal planning happens across sticky notes, group chats, and supermarket apps
- Shopping lists don't match what's already in the pantry
- No single source of truth for "what are we eating this week"

**What Demmi offers them:**
- Shared shopping list (future: multi-user)
- Week view for at-a-glance family meal planning
- Pantry stock tracking with out-of-stock flags

---

## 3. Feature Audit

### 3.1 Features That Directly Serve the Goal ✅

| Feature | Why It Matters |
|---|---|
| **AI Chat (Ollama)** | Core differentiator — context-aware cooking assistant that remembers your inventory |
| **Recipe Management** | Foundation of the app — CRUD, image upload, Cook Mode, share links |
| **Ingredient Tracking** | Enables the AI to answer "what can I make?" with real pantry data |
| **Meal Planner Calendar** | Converts one-off recipe browsing into a weekly cooking habit |
| **Shopping List** | Closes the loop from planning to purchasing |
| **Demo Mode** | Critical for zero-friction first impressions; reduces sign-up friction |
| **AI Recipe Creation (chat)** | Differentiates from a static recipe app — feels alive and personalised |
| **Recipe from Text / URL** | Practical utility — captures recipes the user already has elsewhere |
| **Cook Mode** | Elevates from storage to active use; voice navigation is a premium-feel touch |
| **Recipe Sharing** | Viral growth lever — lets users share without requiring recipient sign-up |
| **Barcode Lookup** | Reduces friction for ingredient entry; ties to Open Food Facts data |

### 3.2 Features That Exist but Are Incomplete or Broken ⚠️

| Feature | Current State | Gap |
|---|---|---|
| **Ollama ↔ Electron IPC** | Ollama calls go via direct HTTP from the renderer process | Needs to route through Electron main process via IPC; direct `localhost` calls fail in some Electron security contexts and break in packaged builds |
| **Barcode Entry** | Manual barcode number input only | No camera/scanner integration — on mobile and desktop there is hardware available to scan; typed barcodes are a poor UX |
| **Chat on Mobile** | Ollama requires a local server; React Native WebView can't reach `localhost:11434` | Chat is silently broken or missing on mobile — needs a graceful disabled state with a clear explanation, or an optional cloud API fallback |
| **AI Recipe Creation** | Works in chat but intent detection relies on keyword matching | No dedicated "Create Recipe" entry point; new users won't discover this flow without exploring the chat |
| **Nutrition in Meal Planner** | Totals display exists | Filtering by nutrition goals (e.g. "keep me under 2000 kcal today") isn't wired — data is there but not actionable |
| **Shopping List ↔ Pantry** | Shopping list exists; pantry (ingredients) exists | No "deduct purchased items from pantry" or "auto-populate list from what's missing for this recipe" |
| **Account / Profile Screen** | Screen exists | No dietary preferences, cuisine preferences, or user profile stored — critical for onboarding personalisation |

### 3.3 Features That Add Noise Without Serving the Core Goal ❌

| Feature | Issue | Recommendation |
|---|---|---|
| **About Screen** | Generic placeholder page; adds nav clutter | Remove from main nav; fold into Settings or a footer link |
| **Shared Recipe public view (unauthenticated)** | Good feature, but the sharing flow is buried | Not a removal — but needs a more prominent share CTA on the recipe detail page |

---

## 4. Technical Gaps to Close Before Launch

### 4.1 Electron: Ollama Communication via IPC

**Problem:** The web renderer calls `http://localhost:11434` directly. In a packaged Electron app with `contextIsolation: true` and CSP headers, this can be blocked. The renderer also has no way to know if Ollama is installed, running, or what port it's on.

**Solution:**
1. Add a `check-ollama` IPC handler in the Electron main process that attempts the health check and returns status to the renderer
2. Add a `proxy-ollama` IPC channel for streaming chat completions — main process forwards to Ollama and streams back to renderer via `ipcMain.handle` + `webContents.send`
3. Update `useOllamaModels` and the Ollama service layer to detect the runtime environment (`window.electronAPI` presence) and route accordingly
4. Show a native OS notification (Electron `Notification` API) when Ollama is not running, with a "Start Ollama" deep-link button

### 4.2 Mobile: Chat Feature Strategy

**Problem:** Ollama runs on `localhost`. On iOS/Android (React Native WebView), `localhost` inside the WebView refers to the device, not the user's desktop, so Ollama is unreachable.

**Options (in order of priority):**

| Option | Pros | Cons |
|---|---|---|
| **A. Graceful disable with explanation** | Simple, honest, keeps the app free | Reduces value of mobile app significantly |
| **B. LAN detection — connect to host machine's Ollama** | Free, works for power users | Requires the user to know their LAN IP; complex setup |
| **C. Optional cloud API (OpenAI/Gemini fallback)** | Works everywhere, best UX | Requires API key management; costs money; breaks privacy promise for those users |
| **D. Future: on-device model (llama.cpp / MLC LLM)** | Fully private on mobile | Model size constraints; months away from practical |

**Recommended short-term action:** Implement Option A cleanly — detect WebView/mobile environment, disable the Chat tab, and show an informative screen explaining that chat requires Ollama on a desktop. Add a "Learn more" link to the Ollama setup guide. Plan Option C as a paid tier feature.

### 4.3 Barcode Scanning

**Problem:** The `IngredientBarcodeEntry` screen only accepts manually typed barcodes. The majority of phones have cameras that can scan barcodes natively.

**Solution:**
- Mobile: Use `expo-camera` + `expo-barcode-scanner` in the Expo WebView host to expose a native barcode scanning bridge back to the web layer via `postMessage`
- Desktop: Use a system camera via the browser's `BarcodeDetector` API (Chrome 88+ / Electron Chromium) or a fallback JS library (e.g. `zxing-js`)
- Web (browser): Use the browser's `BarcodeDetector` API where available, with a graceful fallback to the manual input

### 4.4 User Profile & Preferences Storage

**Required for onboarding personalisation (see Section 6):**

Add a `UserProfile` document to Firestore (keyed by `userId`):

```typescript
type DietaryRestriction =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'halal'
  | 'kosher'
  | 'nut-free';

type CuisineType =
  | 'italian'
  | 'asian'
  | 'mexican'
  | 'mediterranean'
  | 'indian'
  | 'middle-eastern'
  | 'american'
  | 'other';

type CookingGoal =
  | 'eat-healthier'
  | 'save-money'
  | 'reduce-waste'
  | 'learn-cooking'
  | 'meal-prep';

type CookingSkillLevel = 'beginner' | 'intermediate' | 'advanced';

interface UserProfile {
  userId: string;
  displayName: string | null;
  avatarId: string | null;
  dietaryRestrictions: DietaryRestriction[];
  cuisinePreferences: CuisineType[];
  cookingGoals: CookingGoal[];
  householdSize: number | null;
  cookingSkillLevel: CookingSkillLevel | null;
  weeklyMealPlanEnabled: boolean;
  onboardingCompletedAt: number | null;
}
```

This data should be:
- Captured during onboarding
- Used to personalise AI chat system prompts (dietary restrictions, cuisine preferences)
- Reflected in recipe recommendations and calendar defaults

---

## 5. Onboarding Flow

### 5.1 Why Onboarding Matters Now

First impressions determine whether a user ever returns. Currently, Demmi drops new users directly into a chat screen after sign-up — with no context about what the app does or how to use it, and with an empty ingredient list, empty recipe list, and a silent AI that requires Ollama to be installed.

This is fine for technical early adopters, but will cause immediate drop-off for the "Google-Cook" primary persona.

### 5.2 Onboarding Design Principles

1. **Make every step feel worth their time** — the user should feel like each question benefits them, not us
2. **Show immediate value** — end the onboarding with something genuinely useful (personalised recipe suggestions, a pre-filled meal plan, or a populated shopping list)
3. **Keep it conversational, not form-like** — large text, single-choice cards, emoji, progress bar
4. **Never hard-paywalled** — offer optional premium features, never block progress
5. **Skippable but encouraged** — every step has a "Skip" option, but copy should make skipping feel like a loss

### 5.3 Proposed Onboarding Flow (8–10 Steps)

```
Step 1: Welcome
  "Welcome to Demmi 👋
   Let's get your kitchen set up in under 2 minutes."
  → [Let's go] [Skip setup]

Step 2: What brings you here?
  (Single select — sets tone for the rest of the flow)
  🍽️ I want to plan my meals for the week
  🤖 I want AI help finding recipes
  🥦 I'm trying to eat healthier
  🛒 I want to reduce grocery waste
  📖 I want to organise my recipes

Step 3: Any dietary preferences?
  (Multi-select chips)
  Vegetarian · Vegan · Gluten-Free · Dairy-Free
  Halal · Kosher · Nut-Free · No restrictions

Step 4: Favourite cuisines?
  (Multi-select with emoji flags — pick up to 5)
  🍝 Italian · 🍜 Asian · 🌮 Mexican · 🥙 Mediterranean
  🍛 Indian · 🥘 Middle Eastern · 🍔 American · 🥗 Other

Step 5: How many people are you cooking for?
  Just me · 2 people · 3–4 people · 5+ people

Step 6: How confident are you in the kitchen?
  🔰 Still learning  ·  👨‍🍳 Home cook  ·  🍴 Pretty experienced

Step 7: How much time do you usually have to cook?
  ⚡ Under 20 mins  ·  🕐 Around 30 mins  ·  🍲 Happy to take my time

Step 8: (Optional) Add a few ingredients you usually have
  "This helps Demmi suggest recipes you can actually make."
  [+ Pasta]  [+ Chicken]  [+ Eggs]  ... (quick-add chips from common items)
  [Skip for now]

Step 9: AI personalisation summary (value moment)
  "Based on what you've told us, here are 3 recipes we think you'll love:"
  [Recipe Card] [Recipe Card] [Recipe Card]
  "Demmi will remember your preferences every time you ask for ideas."
  → [Save these recipes →] [Skip]

Step 10: Setup complete 🎉
  "You're all set! Here's what you can do:"
  → Quick tour cards (Chat, Recipes, Calendar, Shopping List)
  → [Go to my kitchen →]
```

### 5.4 How Onboarding Data Gets Used

| Data Captured | Where Used |
|---|---|
| Dietary restrictions | Injected into AI system prompt; used to filter recipe suggestions |
| Cuisine preferences | AI uses to bias recipe creation; surfaces relevant categories first |
| Cooking goal | Drives copy and CTAs in empty states throughout the app |
| Household size | Default serving size when creating recipes |
| Skill level | AI adjusts recipe complexity and step-by-step detail accordingly |
| Time preference | AI favours recipes within stated time range when suggesting |
| Starter ingredients | Pre-populates ingredient inventory; enables immediate "what can I make?" query |
| Saved recipes (Step 9) | Populates recipe collection; creates a non-empty starting state |

### 5.5 Onboarding Technical Considerations

- Onboarding state should live in `UserProfile.onboardingCompletedAt` — if `null`, show onboarding on next login
- Onboarding UI should be a full-screen overlay route (`/onboarding`) with a step controller (indexed state), not a modal
- Animate transitions between steps (slide or fade) to feel polished
- Progress bar at the top (e.g. "Step 3 of 8")
- On "Save these recipes" (Step 9): dispatch `createRecipe` thunks for the suggested recipes in the background
- Onboarding should be re-triggerable from Account settings ("Reset onboarding")

---

## 6. Design Polish

### 6.1 Current State Assessment

The app is functional and consistently styled (orange accent, Dreamer UI components, dark mode) but reads as a developer prototype, not a consumer product. The gap between "it works" and "I want to use this every day" is primarily a design gap.

### 6.2 High-Impact Design Improvements

#### 6.2.1 Empty States
Every feature starts empty. Currently, empty states are minimal text. Upgrade them to:
- Illustrated (SVG or Lottie) micro-illustrations
- Warm, encouraging copy ("Your recipe collection is waiting to be filled 🍽️")
- Contextual CTAs ("Add your first recipe", "Start a chat with Demi")

#### 6.2.2 Home / Dashboard Screen
Replace the current marketing-style Home screen (for authenticated users) with a **personal dashboard** showing:
- Today's planned meals (from calendar)
- Upcoming ingredient shortages (low stock items)
- Recent chats / quick "Ask Demi" input
- Recipe of the day (personalised based on preferences and pantry)

#### 6.2.3 Typography & Spacing
- Increase heading sizes; the current UI feels visually flat at a glance
- Add more vertical breathing room between sections
- Use a single display font for headings (the existing Tailwind stack is fine for body)

#### 6.2.4 Micro-interactions & Feedback
- Skeleton loading states for all data-dependent screens (recipes, ingredients, calendar)
- Haptic-style subtle animations on actions (add to shopping list, check off item, recipe saved)
- Toast notifications for all async actions (already partially implemented — make consistent)

#### 6.2.5 Recipe Cards
- Recipes without images use a gradient placeholder — make these more visually interesting (category-colour background + emoji)
- Add a "Quick add to meal plan" button directly on the card (currently requires navigating into detail)

#### 6.2.6 Chat UI
- Add a typing indicator when the AI is streaming
- Show model name as a subtle badge on assistant messages
- The chat sidebar could show conversation snippets (first 40 chars of first message)
- Add "suggested prompts" in the empty conversation state based on user preferences

#### 6.2.7 Mobile Experience
- The current WebView wrapper works but feels like a website on mobile
- Consider: native-like bottom tab navigation in the web layer when `useIsMobileDevice()` is true
- Larger touch targets on recipe cards and shopping list items
- Swipe-to-delete or swipe-to-check on list items

---

## 7. Business Model

### 7.1 Guiding Principle

Demmi's core value proposition is **local-first and private**. Monetisation must not undermine this. The business model should reward users who want cloud-enhanced features while keeping the local experience fully free.

### 7.2 Tier Structure

#### Free Tier — "Local" (Default)
Everything that runs locally, at no cost, forever.

| Feature | Included |
|---|---|
| All recipe, ingredient, calendar, shopping list CRUD | ✅ |
| AI chat via local Ollama | ✅ |
| AI recipe creation via chat | ✅ |
| Barcode lookup (Open Food Facts) | ✅ |
| Cook Mode with voice navigation | ✅ |
| Recipe sharing (public links) | ✅ |
| Demo Mode | ✅ |
| Firebase sync (personal data, not AI) | ✅ |
| Up to N recipes / ingredients / plans | ✅ (generous limit TBD) |

#### Pro Tier — "Cloud" ($X/month or $Y/year)
Cloud-enhanced features for users who want AI without running Ollama.

| Feature | Included |
|---|---|
| Cloud AI chat (OpenAI / Gemini API — routed through Demmi's backend) | ✅ |
| AI chat on mobile | ✅ |
| Nutrition goal tracking & alerts | ✅ |
| Advanced meal plan automation (AI-generated week plan from preferences) | ✅ |
| Priority recipe suggestions based on expiry dates | ✅ |
| Unlimited storage (recipes, images, ingredients) | ✅ |
| Offline mode / local cache for mobile | ✅ |

#### Family Tier (Future)
- Multi-user shared shopping list and calendar
- Up to 5 user profiles under one household
- Shared recipe collection with permissions

### 7.3 Free vs. Paid Decision Framework

| Question | Answer |
|---|---|
| Is this feature better with local AI? | Free |
| Does it require cloud compute/API costs? | Paid |
| Would removing it break core privacy promise? | Must stay free |
| Does it add convenience but not core function? | Paid |

### 7.4 Pricing Considerations

- **Free trial period:** 14–30 days of Pro for all new accounts (aligns with onboarding hook)
- **Student discount:** Apply for free or reduced Pro access
- **Indie / Self-hosted option:** Allow users to bring their own OpenAI API key for cloud AI features at the Free tier level
- **Never hard-paywalled:** A user should always be able to use the core app fully for free with Ollama

---

## 8. Notifications Strategy

### 8.1 Desktop (Electron)

The Electron `Notification` API is available in the main process. Useful notifications:

| Trigger | Notification |
|---|---|
| Ollama offline when app opens | "Ollama isn't running — AI chat is disabled. Click to start Ollama." |
| Ingredient running low (below threshold) | "You're running low on [ingredient] — add it to your shopping list?" |
| Meal plan reminder | "You haven't planned dinner for today yet." |
| Recipe generation complete | "Your new recipe is ready: [title]" |

### 8.2 Mobile (Expo)

Expo supports push notifications via `expo-notifications`. For the initial release:
- **Defer push notifications** — they require a backend notification service and device registration which adds significant complexity
- **In-app banners** are sufficient for MVP (already partially via Toast)
- Post-launch: add daily meal reminder and shopping day reminders

### 8.3 Web

- Browser `Notification` API available but requires explicit permission; generally a poor user experience to prompt for
- Rely on in-app toast / callout notifications for all web alerts
- Consider a simple notification bell / inbox component for persistent in-app alerts (future)

### 8.4 Recommendation for Launch

Ship Electron-only desktop notifications (low effort, high value for desktop users). Defer mobile push and web browser notifications to a post-launch milestone.

---

## 9. Long-Term Vision

### 18-Month Vision: "The Kitchen OS"

Demmi becomes the operating system for a household's cooking life — the single place where everything food-related lives, learns, and improves.

**Future capabilities to explore:**

| Capability | Description |
|---|---|
| **Expiry tracking** | Log ingredient purchase dates; get alerts before things go bad; AI suggests "use it up" recipes |
| **Meal plan auto-generation** | AI generates a full week's meal plan from preferences, pantry, budget, and nutrition goals in one tap |
| **Smart shopping** | Integrates with grocery delivery APIs (Instacart, Kroger, etc.) to order directly from the shopping list |
| **Community recipes** | Public recipe browsing (opt-in sharing); trending recipes; follow other cooks |
| **Cooking history / journal** | Log meals actually cooked vs. planned; rate them; build a personal taste profile |
| **Family profiles** | Individual preferences per household member; AI adapts suggestions to who's eating |
| **Nutrition dashboards** | Weekly reports, macro trends, comparison against dietary goals |
| **Multi-device Ollama** | Point mobile Demmi at the local desktop's Ollama over LAN |

---

## 10. Marketing Ideas

### 10.1 Positioning Statement

> "Demmi is the AI meal planner that actually knows what's in your kitchen — and keeps it private."

### 10.2 Pre-Launch

| Idea | Platform | Effort |
|---|---|---|
| **"I replaced ChatGPT for meal planning"** demo video | YouTube / TikTok | Medium |
| Reddit posts in r/selfhosted, r/mealprep, r/privacy | Reddit | Low |
| Product Hunt launch (with demo GIF, screenshots, founder post) | Product Hunt | Medium |
| Hacker News "Show HN" post focused on local LLM angle | HN | Low |
| Build-in-public Twitter/X thread — share progress weekly | X / Twitter | Low |

### 10.3 Content Marketing (Ongoing)

| Idea | Description |
|---|---|
| **Blog / newsletter** | "5 recipes you can make from what's already in your fridge" — powered by Demmi |
| **YouTube channel** | Short cooking planning videos using Demmi as the tool |
| **Discord community** | Early access community for beta users; direct feedback channel |
| **Ollama integration guides** | Tutorials on setting up Ollama + Demmi; attract the technical privacy-first crowd |

### 10.4 Post-Launch Growth

| Lever | Description |
|---|---|
| **Referral program** | "Invite a friend, both get 1 month Pro free" |
| **Recipe sharing virality** | Every shared recipe page has a "Try Demmi" CTA — organic acquisition from existing users |
| **App Store / Google Play listing** | Once mobile is polished, Play Store and App Store listings with optimised screenshots |
| **Comparison content** | "Demmi vs. Mealime", "Demmi vs. ChatGPT for cooking" — capture intent-driven search traffic |

---

## 11. Two–Three Week Sprint Plan

> **Goal:** Ship a v1.0 release candidate that a non-technical first-time user can install, onboard through, and find genuinely useful — without needing to read any documentation.

### Week 1: Foundation & Polish

**Theme: Fix what's broken, clean up what's noisy**

| Task | Priority | Owner Area |
|---|---|---|
| Wire Ollama through Electron IPC (main process health check + proxy) | 🔴 Critical | Electron |
| Implement mobile Chat disabled state (detect WebView, show clear explanation) | 🔴 Critical | Web/Mobile |
| Remove About screen from main navigation | 🟡 Medium | Web |
| Add `UserProfile` Firestore schema and Redux slice | 🔴 Critical | Web (store) |
| Empty state illustrations + copy for Recipes, Ingredients, Shopping List, Chat | 🟡 Medium | Web (UI) |
| Consistent skeleton loading across all data-dependent screens | 🟡 Medium | Web (UI) |
| Home screen → personal Dashboard (today's meals, low stock, quick chat) for logged-in users | 🟡 Medium | Web |
| Recipe cards: category-coloured placeholder for missing images | 🟢 Low | Web |
| "Quick add to meal plan" button on recipe cards | 🟢 Low | Web |

### Week 2: Onboarding & Personalisation

**Theme: Capture user intent up front, deliver value immediately**

| Task | Priority | Owner Area |
|---|---|---|
| Build onboarding flow (Steps 1–10) with step controller, animations, progress bar | 🔴 Critical | Web |
| Implement `UserProfile` onboarding save thunk (Firestore) | 🔴 Critical | Web (store) |
| Inject dietary restrictions and cuisine preferences into Ollama system prompt | 🔴 Critical | Web (ollama) |
| Quick-add ingredient chips (Step 8 of onboarding) — pre-populate pantry | 🟡 Medium | Web |
| AI recipe suggestions for Step 9 (3 personalised recipes from preferences) | 🟡 Medium | Web |
| "Re-run onboarding" option in Account settings | 🟢 Low | Web |
| Update AI system prompt to reference household size and skill level | 🟡 Medium | Web (ollama) |
| Suggested prompts in empty Chat state (based on user preferences) | 🟢 Low | Web |

### Week 3: Business Model, Notifications & Release Prep

**Theme: Polish the release, establish the foundation for monetisation**

| Task | Priority | Owner Area |
|---|---|---|
| Electron desktop notifications (Ollama status, low ingredient stock) | 🟡 Medium | Electron |
| Bring-your-own API key UI (Account screen — OpenAI key for cloud chat) | 🟡 Medium | Web |
| Pro tier gate: cloud API chat routes through BYOK key if present | 🟡 Medium | Web |
| Free trial countdown banner for new accounts | 🟢 Low | Web |
| Barcode camera scanning (web `BarcodeDetector` + Expo bridge stub) | 🟡 Medium | Web/Mobile |
| Shopping list ↔ pantry: "Mark as purchased → deduct from inventory" flow | 🟡 Medium | Web |
| Firestore security rules audit for new `UserProfile` collection | 🔴 Critical | Firebase |
| Production smoke test: sign up → onboard → create recipe via chat → plan → shop | 🔴 Critical | QA |
| Update root README and web README for v1.0 launch state | 🟡 Medium | Docs |
| Product Hunt launch assets (screenshots, GIF, copy) | 🟡 Medium | Marketing |

---

## 12. Open Questions to Resolve

| Question | Options | Recommendation |
|---|---|---|
| **Ollama on mobile**: disable or BYOK API? | Disable (safe), BYOK (power users) | Start with disable; add BYOK as Pro feature in week 3 |
| **Subscription pricing** | $5/mo, $8/mo, $12/mo | Survey 5–10 early adopters; consider $7/mo / $60/year |
| **Recipe storage limit on Free** | 50, 100, unlimited | Start unlimited; add soft limit if costs become an issue |
| **Onboarding AI suggestions (Step 9)**: pre-baked or live? | Pre-baked curated list, filtered by preferences | Pre-baked for v1 (fast, no Ollama required); live AI for v2 |
| **App name / branding**: "Demmi" vs "Demi" vs other | Current: Demmi | Stick with Demmi; "Demi" is the AI persona's name |
| **Firebase vs. self-hosted backend** | Firebase | Keep Firebase for launch; evaluate if scale requires backend service |

---

## Appendix: Feature Gap Summary Table

| Feature | Status | Action |
|---|---|---|
| AI Chat (Ollama) | ✅ Works on web/desktop | Fix Electron IPC; disable cleanly on mobile |
| Recipe CRUD | ✅ Complete | Minor polish (empty states, card improvements) |
| Ingredient Tracking | ✅ Complete | Add camera barcode scanning |
| Meal Planner | ✅ Complete | Link to dashboard; add nutrition goal gating |
| Shopping List | ✅ Complete | Add "purchase → deduct pantry" flow |
| Cook Mode | ✅ Complete | — |
| Recipe Sharing | ✅ Complete | More prominent CTA on recipe detail |
| Barcode Entry | ⚠️ Manual only | Add camera scanner (web + mobile) |
| Onboarding | ❌ Missing | Build full 8–10 step flow (Week 2) |
| User Profile / Preferences | ❌ Missing | Schema + Redux slice + onboarding save (Week 1/2) |
| Dashboard / Home (authenticated) | ⚠️ Marketing page only | Replace with personal dashboard (Week 1) |
| Electron IPC for Ollama | ⚠️ Direct HTTP | Proxy through IPC (Week 1) |
| Mobile Chat | ⚠️ Broken / undefined | Graceful disable + explanation (Week 1) |
| Desktop Notifications | ❌ Missing | Add via Electron Notification API (Week 3) |
| BYOK / Cloud AI Option | ❌ Missing | Account screen + routing (Week 3) |
| Subscription / Pro Tier | ❌ Missing | Gate design + BYOK as first Pro feature (Week 3) |
| Shopping list → pantry deduction | ❌ Missing | "Mark purchased" flow (Week 3) |
