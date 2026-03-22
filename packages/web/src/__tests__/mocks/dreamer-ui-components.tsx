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
