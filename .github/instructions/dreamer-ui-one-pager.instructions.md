---
applyTo: 'packages/web/src/**/*'
---

# Dreamer UI Components

All components are imported from `@moondreamsdev/dreamer-ui/components`.

## Available Components

### Display Components
f
- **Accordion**: Collapsible content sections with expand/collapse functionality.
- **Avatar**: Display user profile pictures with 12 pre-defined cartoon-like avatars inspired by Moon Dreams Dev.
- **Badge**: Small status indicators and labels for highlighting information.
- **Carousel**: Interactive slideshow component for displaying multiple items.
- **Code**: Inline code snippets with syntax highlighting.
- **Code Block**: Syntax-highlighted code display with TypeScript support, copy, and fullscreen.
- **Disclosure**: Collapsible content component with accessible expand/collapse functionality.
- **Dynamic List**: Interactive list component with add, delete, and reorder functionality via drag-and-drop or buttons.
- **Table**: Data table component with sorting, selection, custom cells, and responsive design.

### Overlay Components

- **Action Modal**: Modal component with built-in action buttons for confirmations and forms.
- **Drawer**: Sliding panel component that appears from the side of the screen.
- **Modal**: Overlay component for forms, confirmations, and interactive content.
- **Popover**: Floating content container that appears relative to a trigger element.

### Form Components

- **Button**: Versatile button component with multiple variants, sizes, and states.
- **Calendar**: Comprehensive calendar component supporting single date and range selection with multiple views.
- **Checkbox**: Customizable checkbox with different sizes and colors.
- **Clickable**: Generic clickable wrapper component with hover and focus states.
- **Form**: Flexible form component using factory pattern with built-in validation and state management.
- **Input**: Flexible input component with validation states and different types.
- **Label**: Form label component with proper accessibility attributes.
- **Radio Group**: Group of radio buttons for single selection from multiple options.
- **Select**: Dropdown selection component with search and keyboard navigation.
- **Slider**: Range input component for selecting numeric values.
- **Textarea**: Multi-line text input with auto-expand and character limit features.
- **Toggle**: Switch component for boolean states and settings.

### Feedback Components

- **Callout**: Versatile component for displaying alerts, warnings, and informational messages.
- **Error Boundary**: React error boundary component that catches JavaScript errors and displays fallback UI.
- **Help Icon**: Help icon component that combines InfoCircled icon with tooltip for contextual assistance.
- **Skeleton**: Loading placeholders that mimic the structure of your content.
- **Toast**: Notification component for displaying temporary messages.
- **Tooltip**: Contextual information component that appears on hover or focus.

### Layout Components

- **Card**: Flexible container component that supports images, different screen sizes, and customizable padding.
- **Panel**: Flexible container component for grouping related content.
- **Scroll Area**: Custom scrollable area with styled scrollbars.
- **Separator**: Visual divider component for separating content sections.

### Navigation Components

- **Dropdown Menu**: Contextual menu component with keyboard navigation and accessibility.
- **Pagination**: Navigation component for dividing content across multiple pages.
- **Tabs**: Tabbed interface component for organizing content into sections.

## Exceptions

Two hooks are exported from different paths:

- **useToast**: Import from \`@moondreamsdev/dreamer-ui/hooks\` - Hook for displaying toast notifications. Requires \`ToastProvider\` to be wrapped around your app.
- **useActionModal**: Import from \`@moondreamsdev/dreamer-ui/hooks\` - Hook for displaying action modals with confirmation dialogs. Requires \`ActionModalProvider\` to be wrapped around your app.

### Providers

Import providers from \`@moondreamsdev/dreamer-ui/providers\`:

- **ToastProvider**: Required for \`useToast\` hook. Wrap your app to enable toast notifications.
- **ActionModalProvider**: Required for \`useActionModal\` hook. Wrap your app to enable action modals.
- **DreamerUIProvider**: Combines \`ToastProvider\` and \`ActionModalProvider\`. Wrap your app with this provider for both functionalities.

## Component Factories

Some components use factory patterns for type-safe creation:

- **FormFactories**: Import from \`@moondreamsdev/dreamer-ui/components\` - Provides factory functions (input, textarea, select, checkbox, radio) for creating form fields. See factories.ts for implementation details.
- **DropdownMenuFactories**: Import from \`@moondreamsdev/dreamer-ui/components\` - Provides factory functions (option, group, separator, custom) for creating dropdown menu items. See factories.ts for implementation details.

## Utilities

- **join**: Import from `@moondreamsdev/dreamer-ui/utils` - Utility function for conditionally joining class names.
