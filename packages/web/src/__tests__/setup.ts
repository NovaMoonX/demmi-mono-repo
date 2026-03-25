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

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock Firestore 
vi.mock('@lib/firebase', () => ({
  db: {},
  rtdb: {},
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendEmailVerification: vi.fn(),
  onAuthStateChanged: vi.fn((_auth: unknown, cb: (user: unknown) => void) => {
      cb(null);
      return vi.fn();
    }),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({
    docs: [{ data: () => ({ id: '1', name: 'Milk' }) }],
  }),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  doc: vi.fn(() => ({}))
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  get: vi.fn().mockResolvedValue(mock<DataSnapshot>({ val: () => null, exists: () => false })),
}));

// Mock Ollama client
vi.mock('ollama/browser', () => {
  const mockClient = {
    list: vi.fn(),
    generate: vi.fn(),
    chat: vi.fn(),
    pull: vi.fn(),
  };
  class MockOllama {
    list = mockClient.list;
    generate = mockClient.generate;
    chat = mockClient.chat;
    pull = mockClient.pull;
  }
  return {
    Ollama: MockOllama,
  };
});
