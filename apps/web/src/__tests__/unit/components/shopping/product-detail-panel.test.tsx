import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ProductDetailPanel } from '@/components/shopping/product-detail-panel';

const mockProduct = {
  id: '1',
  name: 'iPhone 15',
  store: 'Amazon',
  price: 8999,
  originalPrice: 9999,
  url: 'https://amazon.com',
  imageUrl: 'https://example.com/image.jpg',
  condition: 'Novo',
  brand: 'Apple',
};

describe('ProductDetailPanel', () => {
  it('should render product name', () => {
    render(
      <ProductDetailPanel
        product={mockProduct}
        isOpen={true}
        onClose={() => {}}
      />
    );
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
  });

  it('should render store name', () => {
    render(
      <ProductDetailPanel
        product={mockProduct}
        isOpen={true}
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Amazon')).toBeInTheDocument();
  });

  it('should render price', () => {
    render(
      <ProductDetailPanel
        product={mockProduct}
        isOpen={true}
        onClose={() => {}}
      />
    );
    expect(screen.getAllByText(/R\$/).length).toBeGreaterThan(0);
  });

  it('should render condition badge', () => {
    render(
      <ProductDetailPanel
        product={mockProduct}
        isOpen={true}
        onClose={() => {}}
      />
    );
    expect(screen.getAllByText('Novo').length).toBeGreaterThan(0);
  });

  it('should render brand', () => {
    render(
      <ProductDetailPanel
        product={mockProduct}
        isOpen={true}
        onClose={() => {}}
      />
    );
    expect(screen.getAllByText(/Apple/).length).toBeGreaterThan(0);
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ProductDetailPanel
        product={mockProduct}
        isOpen={true}
        onClose={onClose}
      />
    );
    const closeButton = screen.getAllByRole('button')[0];
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should not render when isOpen is false', () => {
    render(
      <ProductDetailPanel
        product={mockProduct}
        isOpen={false}
        onClose={() => {}}
      />
    );
    expect(screen.queryByText('iPhone 15')).not.toBeInTheDocument();
  });
});
