# GitHub AI Instructions for project

## Core Development Rules

### 1. Component Creation
- Use `export function ComponentName` syntax (NOT `React.FC` or arrow functions)

### 2. Date Fields
- All date fields must be stored as millisecond timestamps (number, Unix ms)
- Do NOT use the `Date` type for field values; convert to ms at boundaries

### 3. Optional Fields
- Use `| null` for optional fields instead of `?:` since Firebase does not adapt well to `undefined`

### 4. Code Formatting
- **Always use 2 spaces for indentation** (NOT 4 spaces or tabs)
- Ensure consistent indentation across all files
- Configure your editor to use 2 spaces for TypeScript, JavaScript, TSX, and JSX files
- **DO NOT add comments for file structure sections** like `// ─── Constants ───` or `// ─── Component ───`
  - These comments are visual noise and should be omitted
  - Code organization should be self-evident from the structure itself

### 5. Return Value Debugging
- Always store return values in variables before returning them for easier debugging
- This applies to all callbacks, computed values, and complex expressions

```tsx
// ❌ Hard to debug - direct return
const answeredCount = useMemo(() => {
  if (!selectedApartment) return 0;
  return allQuestions.filter(
    (q) => getAnswer(q.id, selectedApartment) !== '',
  ).length;
}, [allQuestions, selectedApartment, getAnswer]);

// ✅ Easy to debug - store in variable first
const answeredCount = useMemo(() => {
  if (!selectedApartment) return 0;
  
  const result = allQuestions.filter(
    (q) => getAnswer(q.id, selectedApartment) !== '',
  ).length;
  
  return result;
}, [allQuestions, selectedApartment, getAnswer]);
```

### 6. Styling & Class Names
- Use TailwindCSS exclusively
- **ALWAYS** use `join` from `@moondreamsdev/dreamer-ui/utils` for conditional class names
- **NEVER** use template literals with `${` for className - always use `join()` instead
- Use existing styles and colors from `packages/web/src/dreamer-ui.css` and `packages/web/src/index.css` when applicable (do not modify them)

```tsx
import { join } from '@moondreamsdev/dreamer-ui/utils';

export function Test({ variant, className }: TestProps) {
  return (
    <div 
      className={join(
        'px-4 py-2 rounded',
        variant === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-secondary',
        className
      )}
    >
      Click me
    </div>
  );
}
```

**❌ NEVER DO THIS:**
```tsx
// Bad - template literals for conditional classes
className={`base-class ${condition ? 'conditional-class' : ''}`}
className={`base-class ${isActive ? 'active' : 'inactive'}`}
```

**✅ ALWAYS DO THIS:**
```tsx
// Good - use join() for all conditional classes
className={join('base-class', condition && 'conditional-class')}
className={join('base-class', isActive ? 'active' : 'inactive')}
```

### 7. Component Library Priority
- Always check Dreamer UI first before creating custom components
- Import from `@moondreamsdev/dreamer-ui/components`, `/hooks`, `/symbols`, `/utils`
- Always check existing props of Dream UI components before setting custom styles

### 8. Monorepo Structure

This is an npm workspaces monorepo with three packages:

```
demmi-monorepo/
├── packages/
│   ├── web/            # React web application (Vite + Firebase) — the core app
│   ├── electron/       # Electron desktop wrapper — loads web build
│   └── mobile/         # Expo React Native wrapper — loads web app via WebView
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/
├── package.json        # Workspace root
├── tsconfig.json       # Root TypeScript config
└── README.md           # Consumer-friendly project overview
```

**Workspace scripts** (run from monorepo root):
- `npm run dev:web` — Start web dev server
- `npm run dev:electron` — Build web + launch Electron
- `npm run dev:mobile` — Start Expo dev server
- `npm run build:web` — Production build for web
- `npm run build:electron` — Production build for Electron

### 8a. Web Package File Structure (`packages/web/`)

Follow the existing structure:
```
packages/web/src/
├── components/         # Reusable UI components (organized in subfolders by screen/feature)
│   ├── calendar/       # Calendar-related components (e.g., TotalsCard, DayCard, MonthView)
│   ├── chat/           # Chat-related components
│   ├── recipes/          # Recipes-related components
│   └── shopping/       # Shopping list components (e.g., ItemRow, ItemFormModal)
├── contexts/           # React context providers (Should always import the context from its hook file)
├── hooks/              # Custom React hooks (should always declare the context they use)
├── lib/                # Domain logic, types, constants, and utilities per feature
│   ├── calendar/       # Calendar types, constants
│   ├── ingredients/    # Ingredient types, constants, emojis, colors
│   ├── recipes/          # Recipe types, constants, emojis, colors
│   └── shoppingList/   # Shopping list types
├── routes/             # Router configuration
├── screens/            # Page/route components (main views)
├── store/              # State management (Redux store and slices)
├── styles/             # Additional CSS/styling files
├── ui/                 # Layout and core UI components
├── utils/              # Shared utility functions (capitalize, generatedId, etc.)
```

**Components folder rules:**
- Organize components into subfolders by screen/tab/feature (e.g., `calendar/`, `recipes/`, `shopping/`)
- Extract sub-components from screen files into dedicated component files
- Each subfolder should have a barrel `index.ts` that re-exports all components, types, and utilities
- Component files may include utility functions specific to that component
- Never dump all components directly in `components/` root — always use a subfolder

**Lib folder rules:**
- Each feature domain gets its own subfolder (e.g., `recipes/`, `ingredients/`, `calendar/`)
- Use `.types.ts` for TypeScript interfaces and types
- Use `.constants.ts` for constants, colors, emojis, and options
- Use `.mock.ts` for mock data (development only)
- Export everything through barrel `index.ts` files

### 9. Import Patterns
```tsx
// Dreamer UI imports
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useTheme } from '@moondreamsdev/dreamer-ui/hooks';

// Project imports using aliases
import { APP_TITLE } from '@lib/app';
import Home from '@screens/Home';
import Layout from '@ui/Layout';
import { router } from '@routes/AppRoutes';
import { RecipeCard } from '@components/recipes';
import { ChatHistory } from '@components/chat';
import { TotalsCard, DayCard, MonthView } from '@components/calendar';
import { ItemRow, ItemFormModal } from '@components/shopping';
import { useCustomHook } from '@hooks/useCustomHook';
import { MyContext } from '@contexts/MyContext';
import { store } from '@store';
import { helper } from '@utils/helper';
import { generatedId } from '@utils/generatedId';
```

### 10. Available Import Aliases (Web Package)

These aliases are configured in `packages/web/vite.config.ts` and `packages/web/tsconfig.app.json`:
- `@/` → `packages/web/src/`
- `@components/` → `packages/web/src/components/`
- `@contexts/` → `packages/web/src/contexts/`
- `@hooks/` → `packages/web/src/hooks/`
- `@lib/` → `packages/web/src/lib/`
- `@routes/` → `packages/web/src/routes/`
- `@screens/` → `packages/web/src/screens/`
- `@store/` → `packages/web/src/store/`
- `@styles/` → `packages/web/src/styles/`
- `@ui/` → `packages/web/src/ui/`
- `@utils/` → `packages/web/src/utils/`

### 11. ID Generation
- **ALWAYS** use `generatedId(entity)` from `@utils/generatedId` for all ID creation
- **NEVER** use `Date.now()`, `Math.random()`, or template literals to create IDs inline
- Uses **nanoid** for URL-friendly entities (appear in routes): `'recipe'`, `'ingredient'`, `'planned'`
- Uses **uuid v4** for other entities: `'chat'`, `'msg'`, `'sl'`, `'prod'`
- The `entity` param is a typed union — use the right entity type for the context

```tsx
// ❌ NEVER DO THIS - inline ID generation
id: `recipe-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
id: `msg-${Date.now()}`

// ✅ ALWAYS DO THIS - use generatedId utility
import { generatedId } from '@utils/generatedId';
id: generatedId('recipe')      // nanoid - URL-friendly
id: generatedId('msg')       // uuid v4
id: generatedId('ingredient') // nanoid - URL-friendly
```

### 12. Number Parsing
- **ALWAYS** use `Number()` for converting strings to numbers
- **NEVER** use `parseFloat()` or `parseInt()` — use `Number()` instead

```tsx
// ❌ NEVER DO THIS
parseFloat(someString)
parseInt(someString, 10)

// ✅ ALWAYS DO THIS
Number(someString)
Number(someString) || 0  // with fallback
```

### 13. Label Component
- **ALWAYS** use the `Label` component from `@moondreamsdev/dreamer-ui/components` for form labels
- **NEVER** use the native HTML `<label>` element
- **NEVER** add `className` to `Label` — the component handles its own styling

```tsx
// ❌ NEVER DO THIS
<label htmlFor="name" className="text-foreground mb-1 block text-sm font-medium">
  Name
</label>
<Label htmlFor="name" className="text-sm text-muted-foreground">Name</Label>

// ✅ ALWAYS DO THIS
import { Label } from '@moondreamsdev/dreamer-ui/components';
<Label htmlFor="name">Name</Label>
```

### 14. Nullish Coalescing (`??` vs `||`)
- **ALWAYS** use `??` (nullish coalescing) instead of `||` by default
- Only use `||` when you explicitly need to handle falsy values like empty strings (`''`), `0`, or `NaN`

```tsx
// ❌ Use || only when falsy check is intentional
existingItem?.category || 'breakfast'   // use ?? instead
existingItem?.products || []            // use ?? instead
conversations[0]?.id || null            // use ?? instead

// ✅ Use ?? for null/undefined fallbacks
existingItem?.category ?? 'breakfast'
existingItem?.products ?? []
conversations[0]?.id ?? null

// ✅ Keep || for explicit falsy checks
productUrl || null           // converts empty string '' to null (intentional)
form.note.trim() || null     // converts empty string to null (intentional)
Number(x) || 0               // handles NaN (intentional)
```

### 15. View / Edit Mode for Detail Pages
- Detail pages for **existing items** must support a **read-only view mode** by default
- Creating a **new item** always shows the form directly (no view mode)
- Use `const [isViewMode, setIsViewMode] = useState(isEditing)` to initialize

```tsx
const isEditing = id !== 'new';
const [isViewMode, setIsViewMode] = useState(isEditing);

// Cancel in edit form:
const handleCancel = () => {
  if (isEditing) {
    setIsViewMode(true);  // return to view mode
  } else {
    navigate('/items');   // leave create form
  }
};

// View mode: show read-only UI with "Edit" and "Delete" buttons
if (isViewMode && isEditing && existingItem) {
  return <ViewModeUI onEdit={() => setIsViewMode(false)} ... />;
}

// Edit/Create form (default when not view mode)
return <form>...</form>;
```

## Quick Reference
- Component syntax: `export function ComponentName`
- **Indentation: Always use 2 spaces (NOT 4 spaces or tabs)**
- **NO file structure comments** like `// ─── Constants ───`
- **Class names: ALWAYS use `join()` for conditionals - NEVER template literals**
- Check Dreamer UI first
- Use import aliases: `@components/`, `@hooks/`, `@lib/`, `@screens/`, `@ui/`, etc.
- **Components: Extract to subfolders under `packages/web/src/components/` by feature (calendar/, shopping/, recipes/)**
- **Lib: Organize by domain with `.types.ts`, `.constants.ts`, and barrel `index.ts` exports**
- Follow structured folder organization with proper separation of concerns
- **ID generation: ALWAYS use `generatedId(entity)` from `@utils/generatedId`**
- **Number parsing: ALWAYS use `Number()`, NEVER `parseFloat()` or `parseInt()`**
- **Form labels: ALWAYS use `Label` from Dreamer UI, NEVER native `<label>` or className on Label**
- **Nullish coalescing: Use `??` by default, only `||` for explicit falsy checks**
- **Detail pages: Always implement view/edit mode for existing items**
- **Testing: Every logic file must have a co-located `.test.ts(x)` file — run `npm test` to validate**

## Monorepo Rules
- **Electron and Mobile packages wrap the web build** — they have no UI code of their own
- **All source code changes happen in `packages/web/`** unless modifying the Electron main process or Expo app shell
- **Root `package.json`** only defines workspaces and cross-package scripts — no dependencies
- **Each package has its own `package.json`, `tsconfig.json`, and `README.md`**
- **Workflows reference `packages/web/`** for builds and Firebase deploys (use `entryPoint: packages/web`)

## ⚠️ Critical Reminders
- **2 spaces for indentation - ALWAYS**
- **NO file structure comments** (e.g., `// ─── Constants ───`) - code should be self-documenting
- **Template literals with `${` in className are FORBIDDEN**
- **Always import and use `join` from `@moondreamsdev/dreamer-ui/utils`**
- **Before writing any conditional className, ask: "Am I using join()?"**
- **`parseFloat` and `parseInt` are FORBIDDEN - use `Number()` instead**
- **Inline ID generation (Date.now, Math.random) is FORBIDDEN - use `generatedId()`**
- **HTML `<label>` is FORBIDDEN - use `Label` from `@moondreamsdev/dreamer-ui/components`**
- **`className` on `Label` is FORBIDDEN - Label handles its own styling**
- **Components must be organized in subfolders by feature under `src/components/`**
- **Extract screen sub-components to separate files in `@components/<feature>/`**
- **Use `.types.ts` and `.constants.ts` in `@lib/<feature>/` for domain logic**
- **Use `??` instead of `||` unless explicitly handling falsy values (empty string, NaN, 0)**
- **Every logic file (hooks, components, utils, slices) MUST have a co-located test file**
- **Run `npm test` before submitting changes to ensure all tests pass**

## Firestore Security Rules

Rules live in `packages/web/firestore.rules`. Always use the reusable helper functions defined at the top of the rules file:

- `isSignedIn()` — returns `true` if the request is authenticated
- `isOwner(userId)` — returns `true` if the requester is signed in and their uid matches `userId`

### Conventions

- Every collection that stores user data **must** include a `userId` field (type `string`) containing the owner's Firebase Auth `uid`.
- Read/update/delete rules must use `isOwner(resource.data.userId)`.
- Create rules must verify `request.resource.data.userId == request.auth.uid`.
- `userId` must be immutable on update: assert `request.resource.data.userId == resource.data.userId`.

### Example

```js
match /chats/{chatId} {
  allow read:   if isOwner(resource.data.userId);
  allow create: if isSignedIn()
    && request.resource.data.userId == request.auth.uid;
  allow update: if isOwner(resource.data.userId)
    && request.resource.data.userId == resource.data.userId;
  allow delete: if isOwner(resource.data.userId);
}
```

### Async Thunks and Demo Mode

All Firestore async thunks (in `packages/web/src/store/actions/`) must:

1. Read the current user from Redux state via `getState().user.user?.uid` — never accept `userId` as a parameter.
2. Use the `condition` option to silently skip execution when demo mode is active:

```ts
{ condition: (_, { getState }) => !(getState() as RootState).demo.isActive }
```

This ensures demo mode never touches Firestore and throws no errors.



### 16. Testing
Every file that contains logic (hooks, components, utilities, Redux slices) must have a co-located test file named `<filename>.test.ts(x)`.

**Testing Philosophy:**
- Test what happens **within** the component/hook/utility — not nested child behavior
- For screens, mock child components (e.g., `IngredientCard`, `RecipeCard`) and verify they are rendered with correct props
- For Redux slices, test synchronous reducers directly by importing the reducer and action creators
- Keep tests focused; avoid testing every edge case — test what matters

**Running Tests:**
```bash
# All packages
npm test

# Individual packages
npm run test:web
npm run test:electron
npm run test:mobile
```

**Test Infrastructure (Web):**
- **Framework**: Jest with `@swc/jest` transform
- **Component testing**: `@testing-library/react` + `@testing-library/jest-dom`
- **Shared helpers**: `src/__tests__/helpers/renderWithProviders.tsx` — wraps components with Redux Provider + MemoryRouter
- **Mocks**: `src/__tests__/mocks/` — Dreamer UI components, Firebase config
- **Setup**: `src/__tests__/setup.ts` (jest-dom matchers, matchMedia/IntersectionObserver mocks)

**Test Infrastructure (Electron):**
- **Framework**: Jest with `@swc/jest` transform
- **Environment**: Node

**Test Infrastructure (Mobile):**
- **Framework**: Jest with `react-native` preset
- **Component testing**: `@testing-library/react-native`

**When adding new files:**
- ✅ New utility function → add `<name>.test.ts` in the same directory
- ✅ New Redux slice → add `<sliceName>.test.ts` in `store/slices/`
- ✅ New hook → add `<hookName>.test.ts` in `hooks/`
- ✅ New component → add `<ComponentName>.test.tsx` in the same directory
- ✅ New screen → add `<ScreenName>.test.tsx` in `screens/`
- ❌ Constant files, type files, mock data files → no tests needed

**CI:** Tests run automatically via GitHub Actions on push to `main` and on pull requests.

### 17. README.md Update Rule
**CRITICAL**: READMEs must be updated with **EVERY** change to the codebase.

This is a monorepo with multiple READMEs:
- **Root `README.md`** — Consumer-facing project overview (what Demmi is, who it's for, features, use cases)
- **`packages/web/README.md`** — Web app developer docs (setup, scripts, architecture, data schema)
- **`packages/electron/README.md`** — Electron developer docs (setup, scripts, packaging)
- **`packages/mobile/README.md`** — Expo/React Native developer docs (setup, scripts, configuration)

Update the appropriate README(s) based on what changed.

**When to Update README:**
- ✅ Adding new features or functionality
- ✅ Modifying security implementation (encryption, authentication, etc.)
- ✅ Changing UI/UX elements or design
- ✅ Updating dependencies or tech stack
- ✅ Modifying data schemas or architecture
- ✅ Adding or changing configuration requirements
- ✅ Implementing new security measures
- ✅ Changing file upload limits or constraints
- ✅ Modifying authentication flow
- ✅ Any user-facing changes

**What to Update in README:**
1. **Features Section**: Add/update feature descriptions with emojis and clear explanations
2. **Security Architecture**: Document any encryption, authentication, or security changes
3. **Usage Guide**: Update if user workflows or steps change
4. **Security Notes**: Add warnings or important security information
5. **Data Schema**: Update TypeScript interfaces if data structure changes
6. **Tech Stack**: Update versions or add new technologies
7. **Troubleshooting**: Add solutions to new common issues
8. **Design & Visual Aesthetic**: Document design changes or visual updates

**README Update Checklist:**
- [ ] Is this change user-visible or security-related?
- [ ] Does this affect how users interact with the app?
- [ ] Does this change security guarantees or encryption?
- [ ] Does this modify setup or configuration requirements?
- [ ] Have I updated all relevant README sections?
- [ ] Are code examples accurate and up-to-date?
- [ ] Are version numbers current?

**Why This Matters:**
The README is the **primary documentation** for potential users. Outdated documentation:
- ❌ Misleads users about capabilities
- ❌ Creates security misunderstandings
- ❌ Causes setup/configuration issues
- ❌ Damages project credibility
- ❌ Wastes user time troubleshooting

**Example:**
```markdown
# Before making changes
- Check current README sections
- Note what needs updating

# After making changes
- Update affected README sections
- Verify all examples still work
- Check that security claims are accurate
- Update version numbers if needed
- Add new troubleshooting if needed
```

**README Sections to Monitor:**
1. Root README: Features, Tech Stack, Repository Structure, Quick Start
2. Web README: Features, Tech Stack, Setup, Data Schema, Project Structure
3. Electron README: Setup, Scripts, Configuration
4. Mobile README: Setup, Scripts, Configuration, WebView URL

**Enforcement:**
- Every PR should include README updates if applicable
- Code reviews should verify README accuracy
- Outdated README is considered a bug
