import { vi } from 'vitest';

export function useToast() {
  return { toast: vi.fn() };
}

export function useActionModal() {
  return { showModal: vi.fn() };
}

export function useTheme() {
  return { resolvedTheme: 'light', toggleTheme: vi.fn() };
}
