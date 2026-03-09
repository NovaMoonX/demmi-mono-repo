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
- Use existing styles and colors from `src/dreamer-ui.css` and `src/index.css` when applicable (do not modify them)

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

### 8. File Structure
Follow the existing structure:
```
src/
├── components/         # Reusable UI components (organized in subfolders by screen/feature)
│   ├── calendar/       # Calendar-related components (e.g., TotalsCard, DayCard, MonthView)
│   ├── chat/           # Chat-related components
│   ├── meals/          # Meals-related components
│   └── shopping/       # Shopping list components (e.g., ItemRow, ItemFormModal)
├── contexts/           # React context providers (Should always import the context from its hook file)
├── hooks/              # Custom React hooks (should always declare the context they use)
├── lib/                # Domain logic, types, constants, and utilities per feature
│   ├── calendar/       # Calendar types, constants
│   ├── ingredients/    # Ingredient types, constants, emojis, colors
│   ├── meals/          # Meal types, constants, emojis, colors
│   └── shoppingList/   # Shopping list types
├── routes/             # Router configuration
├── screens/            # Page/route components (main views)
├── store/              # State management (Redux store and slices)
├── styles/             # Additional CSS/styling files
├── ui/                 # Layout and core UI components
├── utils/              # Shared utility functions (capitalize, generatedId, etc.)
```

**Components folder rules:**
- Organize components into subfolders by screen/tab/feature (e.g., `calendar/`, `meals/`, `shopping/`)
- Extract sub-components from screen files into dedicated component files
- Each subfolder should have a barrel `index.ts` that re-exports all components, types, and utilities
- Component files may include utility functions specific to that component
- Never dump all components directly in `components/` root — always use a subfolder

**Lib folder rules:**
- Each feature domain gets its own subfolder (e.g., `meals/`, `ingredients/`, `calendar/`)
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
import { MealCard } from '@components/meals';
import { ChatHistory } from '@components/chat';
import { TotalsCard, DayCard, MonthView } from '@components/calendar';
import { ItemRow, ItemFormModal } from '@components/shopping';
import { useCustomHook } from '@hooks/useCustomHook';
import { MyContext } from '@contexts/MyContext';
import { store } from '@store';
import { helper } from '@utils/helper';
import { generatedId } from '@utils/generatedId';
```

### 10. Available Import Aliases
- `@/` → `src/`
- `@components/` → `src/components/`
- `@contexts/` → `src/contexts/`
- `@hooks/` → `src/hooks/`
- `@lib/` → `src/lib/`
- `@routes/` → `src/routes/`
- `@screens/` → `src/screens/`
- `@store/` → `src/store/`
- `@styles/` → `src/styles/`
- `@ui/` → `src/ui/`
- `@utils/` → `src/utils/`

### 11. ID Generation
- **ALWAYS** use `generatedId(entity)` from `@utils/generatedId` for all ID creation
- **NEVER** use `Date.now()`, `Math.random()`, or template literals to create IDs inline
- Uses **nanoid** for URL-friendly entities (appear in routes): `'meal'`, `'ingredient'`, `'planned'`
- Uses **uuid v4** for other entities: `'chat'`, `'msg'`, `'sl'`, `'prod'`
- The `entity` param is a typed union — use the right entity type for the context

```tsx
// ❌ NEVER DO THIS - inline ID generation
id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
id: `msg-${Date.now()}`

// ✅ ALWAYS DO THIS - use generatedId utility
import { generatedId } from '@utils/generatedId';
id: generatedId('meal')      // nanoid - URL-friendly
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
- **Components: Extract to subfolders under `src/components/` by feature (calendar/, shopping/, meals/)**
- **Lib: Organize by domain with `.types.ts`, `.constants.ts`, and barrel `index.ts` exports**
- Follow structured folder organization with proper separation of concerns
- **ID generation: ALWAYS use `generatedId(entity)` from `@utils/generatedId`**
- **Number parsing: ALWAYS use `Number()`, NEVER `parseFloat()` or `parseInt()`**
- **Form labels: ALWAYS use `Label` from Dreamer UI, NEVER native `<label>` or className on Label**
- **Nullish coalescing: Use `??` by default, only `||` for explicit falsy checks**
- **Detail pages: Always implement view/edit mode for existing items**

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

## 📚 Documentation Maintenance

### 11. README.md Update Rule
**CRITICAL**: The README.md must be updated with **EVERY** change to the codebase.

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
1. Features (categorized by Security, Authentication, Data Management, UI)
2. Tech Stack (versions matter!)
3. Security Architecture (encryption details, iterations, algorithms)
4. Usage Guide (step-by-step user flows)
5. Security Notes (critical warnings)
6. Data Schema (TypeScript interfaces)
7. Design & Visual Aesthetic (visual design system)
8. Firestore Rules (security rule explanations)
9. Troubleshooting (common issues and solutions)
10. Project Structure (file organization)

**Enforcement:**
- Every PR should include README updates if applicable
- Code reviews should verify README accuracy
- Outdated README is considered a bug
