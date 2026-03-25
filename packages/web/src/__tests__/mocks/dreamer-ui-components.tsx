import React from 'react';

export function Badge({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
  return React.createElement('span', { 'data-testid': 'badge', ...props }, children);
}

export function Button({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
  return React.createElement('button', { 'data-testid': 'button', ...props }, children);
}

export function Card({ children, footer, ...props }: React.PropsWithChildren<{ footer?: React.ReactNode } & Record<string, unknown>>) {
  return React.createElement('div', { 'data-testid': 'card', ...props },
    children,
    footer ? React.createElement('div', { 'data-testid': 'card-footer' }, footer) : null,
  );
}

export function Input(props: Record<string, unknown>) {
  return React.createElement('input', { 'data-testid': 'input', ...props });
}

export function Select({ options, value, onChange, ...props }: { options?: Array<{ value: string; text: string }>; value?: string; onChange?: (val: string) => void } & Record<string, unknown>) {
  return React.createElement('select', {
    'data-testid': 'select',
    value,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange?.(e.target.value),
    ...props,
  },
    options?.map((opt) => React.createElement('option', { key: opt.value, value: opt.value }, opt.text)),
  );
}

export function Toggle({ checked, onCheckedChange, ...props }: { checked?: boolean; onCheckedChange?: (val: boolean) => void } & Record<string, unknown>) {
  return React.createElement('input', {
    'data-testid': 'toggle',
    type: 'checkbox',
    checked,
    onChange: () => onCheckedChange?.(!checked),
    ...props,
  });
}

export function Label({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
  return React.createElement('label', props, children);
}

export function Modal({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
  return React.createElement('div', { 'data-testid': 'modal', ...props }, children);
}

export function Textarea(props: Record<string, unknown>) {
  return React.createElement('textarea', { 'data-testid': 'textarea', ...props });
}

export function Tabs({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
  return React.createElement('div', { 'data-testid': 'tabs', ...props }, children);
}

export function Clickable({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
  return React.createElement('div', { 'data-testid': 'clickable', ...props }, children);
}

export function Tooltip({ children }: React.PropsWithChildren<Record<string, unknown>>) {
  return React.createElement(React.Fragment, null, children);
}

export function Popover({ children }: React.PropsWithChildren<Record<string, unknown>>) {
  return React.createElement(React.Fragment, null, children);
}

export function Checkbox(props: Record<string, unknown>) {
  return React.createElement('input', { 'data-testid': 'checkbox', type: 'checkbox', ...props });
}

export function Skeleton(props: Record<string, unknown>) {
  return React.createElement('div', { 'data-testid': 'skeleton', ...props });
}

export function Separator() {
  return React.createElement('hr', { 'data-testid': 'separator' });
}

export function Avatar(props: Record<string, unknown>) {
  return React.createElement('div', { 'data-testid': 'avatar', ...props });
}

export function CopyButton(props: Record<string, unknown>) {
  return React.createElement('button', { 'data-testid': 'copy-button', ...props }, 'Copy');
}

export function ScrollArea({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
  return React.createElement('div', { 'data-testid': 'scroll-area', ...props }, children);
}

export function DynamicList({ items, ...props }: { items?: Array<{ id: string; content: unknown }> } & Record<string, unknown>) {
  return React.createElement('div', { 'data-testid': 'dynamic-list', ...props },
    items?.map((item) => React.createElement('div', { key: item.id }, typeof item.content === 'string' ? item.content : '')),
  );
}

export function Drawer({ children, isOpen, ...props }: React.PropsWithChildren<{ isOpen?: boolean } & Record<string, unknown>>) {
  if (!isOpen) return null;
  return React.createElement('div', { 'data-testid': 'drawer', ...props }, children);
}

export function TabsContent({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
  return React.createElement('div', { 'data-testid': 'tabs-content', ...props }, children);
}

export function AuthForm(props: Record<string, unknown>) {
  return React.createElement('div', { 'data-testid': 'auth-form', ...props });
}

export function ErrorBoundary({ children }: React.PropsWithChildren<Record<string, unknown>>) {
  return React.createElement('div', { 'data-testid': 'error-boundary' }, children);
}

export function Callout({ children, title, ...props }: React.PropsWithChildren<{ title?: string } & Record<string, unknown>>) {
  return React.createElement(
    'div',
    { 'data-testid': 'callout', ...props },
    title ? React.createElement('p', { 'data-testid': 'callout-title' }, title) : null,
    children,
  );
}
