import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { MonitorsPanel } from '@/components/shopping/monitors-panel';

// Mock the hooks
vi.mock('@/hooks/api/use-shopping', () => ({
  useMonitors: vi.fn(() => ({
    data: {
      monitors: [
        {
          id: '1',
          productName: 'iPhone 15',
          url: 'https://amazon.com',
          currentPrice: 8999,
          targetPrice: 7999,
          lastChecked: '2026-07-23T00:00:00.000Z',
        },
      ],
    },
    isLoading: false,
  })),
  useAddMonitor: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useRemoveMonitor: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useUpdateMonitor: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('MonitorsPanel', () => {
  it('should render monitors', () => {
    render(<MonitorsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
  });

  it('should render add button', () => {
    render(<MonitorsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('Adicionar')).toBeInTheDocument();
  });

  it('should show monitor count', () => {
    render(<MonitorsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('1 monitor(es)')).toBeInTheDocument();
  });

  it('should render price information', () => {
    render(<MonitorsPanel />, { wrapper: createWrapper() });
    expect(screen.getAllByText(/R\$/).length).toBeGreaterThan(0);
  });

  it('should render target price', () => {
    render(<MonitorsPanel />, { wrapper: createWrapper() });
    expect(screen.getAllByText(/Preço Meta/).length).toBeGreaterThan(0);
  });

  it('should render verify button', () => {
    render(<MonitorsPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('Verificar Agora')).toBeInTheDocument();
  });
});
