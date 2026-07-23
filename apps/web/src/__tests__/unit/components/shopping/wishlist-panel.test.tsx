import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { WishlistPanel } from '@/components/shopping/wishlist-panel';

// Mock the hooks
vi.mock('@/hooks/api/use-shopping', () => ({
  useWishlist: vi.fn(() => ({
    data: {
      items: [
        {
          id: '1',
          name: 'iPhone 15',
          store: 'Amazon',
          currentPrice: 8999,
          targetPrice: 7999,
          imageUrl: 'https://example.com/image.jpg',
        },
      ],
    },
    isLoading: false,
  })),
  useAddToWishlist: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useRemoveFromWishlist: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useUpdateWishlistItem: vi.fn(() => ({
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

describe('WishlistPanel', () => {
  it('should render wishlist items', () => {
    render(<WishlistPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    expect(screen.getByText('Amazon')).toBeInTheDocument();
  });

  it('should render add button', () => {
    render(<WishlistPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('Adicionar')).toBeInTheDocument();
  });

  it('should show item count', () => {
    render(<WishlistPanel />, { wrapper: createWrapper() });
    expect(screen.getByText('1 itens')).toBeInTheDocument();
  });

  it('should render price information', () => {
    render(<WishlistPanel />, { wrapper: createWrapper() });
    expect(screen.getAllByText(/R\$/).length).toBeGreaterThan(0);
  });

  it('should render target price', () => {
    render(<WishlistPanel />, { wrapper: createWrapper() });
    expect(screen.getAllByText(/Meta:/).length).toBeGreaterThan(0);
  });
});
