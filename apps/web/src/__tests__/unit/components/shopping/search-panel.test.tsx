import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { SearchPanel } from '@/components/shopping/search-panel';

// Mock the hooks
vi.mock('@/hooks/api/use-shopping', () => ({
  useWishlist: vi.fn(() => ({ data: { items: [] } })),
  useAddToWishlist: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

// Mock the ProductDetailPanel
vi.mock('@/components/shopping/product-detail-panel', () => ({
  ProductDetailPanel: vi.fn(() => null),
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

describe('SearchPanel', () => {
  it('should render search input', () => {
    render(<SearchPanel />, { wrapper: createWrapper() });
    expect(screen.getByPlaceholderText(/buscar produto/i)).toBeInTheDocument();
  });

  it('should render store filter chips', () => {
    render(<SearchPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('Todas as Lojas')).toBeInTheDocument();
    expect(screen.getByText('Amazon')).toBeInTheDocument();
    expect(screen.getByText('Mercado Livre')).toBeInTheDocument();
  });

  it('should render search button', () => {
    render(<SearchPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  it('should update search query on input change', () => {
    render(<SearchPanel />, { wrapper: createWrapper() });
    const input = screen.getByPlaceholderText(/buscar produto/i);
    fireEvent.change(input, { target: { value: 'iPhone' } });
    expect(input).toHaveValue('iPhone');
  });
});
