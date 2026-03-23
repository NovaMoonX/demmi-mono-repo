import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { DataSnapshot } from 'firebase/database';
import { afterEach, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';

afterEach(() => {
  cleanup();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    _callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit,
  ) {}

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock Firestore 
vi.mock('@lib/firebase', () => ({
  db: {},
  rtdb: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({
    docs: [{ data: () => ({ id: '1', name: 'Milk' }) }],
  }),
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  get: vi.fn().mockResolvedValue(mock<DataSnapshot>({ val: () => null, exists: () => false })),
}));
