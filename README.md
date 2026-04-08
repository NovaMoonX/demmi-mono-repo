# Demmi — Your Smart Meal Planning Companion

Demmi is a cross-platform cooking and meal planning assistant powered by a local LLM. It keeps your recipes, ingredients, and grocery planning organized through a simple, friendly interface — with a private AI chat that never sends your data to the cloud.

## What Is Demmi?

Demmi solves a real problem: generic AI tools (ChatGPT, Gemini, etc.) don't know what's in your kitchen, what you cooked last week, or what you need to buy. Every conversation starts from scratch. Demmi connects the dots — your ingredient inventory, saved recipes, recipe calendar, and shopping list all feed into a local AI assistant that actually understands your cooking context.

## Who Is It For?

- **Home cooks** who want to organize recipes, plan weekly recipes, and generate shopping lists in one place
- **Health-conscious individuals** tracking nutrition and ingredient inventory
- **Privacy-first users** who want AI assistance without sending personal data to cloud services
- **Busy families** who need a streamlined recipe-to-grocery workflow
- **Developers** interested in building with local LLMs and modern web technologies

## Goals

1. **Unified cooking workflow** — recipes, ingredients, calendar, and shopping list in a single tool
2. **Local-first AI** — powered by [Ollama](https://ollama.com), your data stays on your device
3. **Cross-platform availability** — web, desktop (Electron), and mobile (Expo / React Native)
4. **Zero cloud dependency for AI** — no subscriptions, no API keys, no usage limits for chat
5. **Approachable UX** — demo mode lets anyone try the app without signing up

## Key Features

| Feature | Description |
|---|---|
| 🎭 **Demo Mode** | Try the full app without creating an account — pre-loaded with realistic mock data |
| 💬 **AI Chat** | Local LLM chat (via Ollama) for recipe ideas, recipe creation, and cooking Q&A |
| 🍽️ **Recipe Management** | Create, edit, and organize recipes with ingredients, instructions, and nutrition |
| 🍎 **Ingredient Tracking** | Manage your pantry with types, amounts, servings, pricing, and barcode scanning |
| 📅 **Meal Planner** | Calendar view for scheduling recipes by day and mealtime (breakfast, lunch, dinner, snack) |
| 🛒 **Shopping List** | Auto-generate grocery lists from planned recipes or add items manually |
| 🔗 **Recipe Sharing** | Share recipes via public link — no account required for viewers |
| 🤖 **AI Recipe Creation** | Chat-driven multi-step recipe generation with ingredient matching and approval flow |
| 🧠 **Agent Memory** | The AI remembers your preferences, context, and goals across conversations |
| 🔧 **Tool-Calling Agent** | The AI can search, create, update, and delete recipes, ingredients, calendar entries, and shopping items on your behalf |
| 🎨 **Light & Dark Mode** | Full theme support with a warm, cooking-inspired orange accent palette |

## Use Cases

- *"What can I cook with what I already have?"* — Ask the AI, and it checks your ingredient inventory
- *"Plan my recipes for the week"* — Schedule breakfast, lunch, dinner, and snacks on the calendar
- *"Create a pasta carbonara recipe"* — The AI generates a full recipe with ingredients, instructions, and nutrition, then adds it to your collection on approval
- *"Generate my shopping list"* — Pull ingredients from planned recipes into a grocery checklist
- *"Share this recipe with a friend"* — One-click shareable link, viewable without an account
- *"What's on my meal plan this week?"* — The AI calls tools to read your calendar and summarize upcoming meals
- *"Add milk and eggs to my shopping list"* — The AI directly adds items without you leaving the chat
- *"Remember that I don't like cilantro"* — The AI saves a memory and recalls it in future conversations

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · TypeScript · TailwindCSS 4 · Redux Toolkit |
| Build | Vite |
| Backend | Firebase (Auth, Firestore, Realtime DB, Hosting) |
| AI | Ollama (local LLM) |
| Desktop | Electron |
| Mobile | Expo (React Native) with WebView |
| UI Library | [@moondreamsdev/dreamer-ui](https://www.npmjs.com/package/@moondreamsdev/dreamer-ui) |

## Repository Structure

This is an **npm workspaces monorepo** containing three packages:

```
demmi-monorepo/
├── packages/
│   ├── web/          # React web application (Vite + Firebase)
│   ├── electron/     # Electron desktop wrapper
│   └── mobile/       # Expo React Native mobile wrapper
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/
├── package.json      # Workspace root
├── tsconfig.json     # Root TypeScript config
└── README.md         # You are here
```

Each package has its own `README.md` with setup instructions, scripts, and developer documentation:

| Package | README | Description |
|---|---|---|
| `packages/web` | [Web README](packages/web/README.md) | The React web app — the core Demmi application |
| `packages/electron` | [Electron README](packages/electron/README.md) | Desktop app that wraps the web build |
| `packages/mobile` | [Mobile README](packages/mobile/README.md) | Expo React Native app that wraps the web app |

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (ships with Node 18+)
- **Ollama** (optional, for AI chat): [ollama.com](https://ollama.com)

### Install All Dependencies

From the repository root:

```bash
npm install
```

This installs dependencies for all packages via npm workspaces.

### Start the Web App

```bash
npm run dev:web
```

### Start the Electron App

```bash
npm run dev:electron
```

### Start the Mobile App (Expo)

```bash
npm run dev:mobile
```

> See each package's README for detailed setup, configuration, and environment variable instructions.

### Run Tests

```bash
# All packages
npm test

# Individual packages
npm run test:web
npm run test:electron
npm run test:mobile
```

## Contributing

1. Clone the repo and run `npm install` at the root
2. Read the relevant package README for the platform you're working on
3. Review `.github/copilot-instructions.md` for coding standards and conventions
4. All TypeScript, 2-space indentation, strict mode enabled across all packages
5. Run `npm test` before submitting changes — CI enforces passing tests on all PRs

## License

This project is private and not currently published under an open-source license.
