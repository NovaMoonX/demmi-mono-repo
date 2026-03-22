export function useToast() {
  return { toast: jest.fn() };
}

export function useActionModal() {
  return { showModal: jest.fn() };
}

export function useTheme() {
  return { resolvedTheme: 'light', toggleTheme: jest.fn() };
}
