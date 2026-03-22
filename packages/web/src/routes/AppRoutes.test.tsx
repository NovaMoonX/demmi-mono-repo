import { describe, it, expect } from 'vitest';
import { router } from './AppRoutes';

describe('AppRoutes', () => {
  it('exports a router object', () => {
    expect(router).toBeDefined();
    expect(router).toHaveProperty('navigate');
  });

  it('has routes configured', () => {
    expect(router.routes).toBeDefined();
    expect(router.routes.length).toBeGreaterThan(0);
  });
});
