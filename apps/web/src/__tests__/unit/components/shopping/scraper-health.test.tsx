import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ScraperHealth } from '@/components/shopping/scraper-health';

// Mock fetch
global.fetch = vi.fn();

describe('ScraperHealth', () => {
  it('should render component', () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { stores: {}, summary: { total: 0, healthy: 0, degraded: 0, down: 0 } } }),
    });

    const { container } = render(<ScraperHealth />);
    expect(container).toBeTruthy();
  });
});
