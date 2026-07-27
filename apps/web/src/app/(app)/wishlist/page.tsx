'use client';

import * as React from 'react';

import { Heart } from 'lucide-react';
import { WishlistGrid } from '@/components/wishlist/wishlist-grid';
import { WishlistForm } from '@/components/wishlist/wishlist-form';
import { useWishlist, useCreateWishlistItem, useUpdateWishlistItem, useDeleteWishlistItem } from '@/hooks/api/use-wishlist';
import type { TravelWishlistItem } from '@/types/wishlist';
import { toast } from 'sonner';

export default function WishlistPage() {
  const [filter, setFilter] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<TravelWishlistItem | null>(null);

  const { data: items, isLoading } = useWishlist(filter || undefined);
  const createItem = useCreateWishlistItem();
  const updateItem = useUpdateWishlistItem();
  const deleteItem = useDeleteWishlistItem();

  const wishlistItems = items || [];

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: TravelWishlistItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate(id, {
      onSuccess: () => toast.success('Item removido da wishlist'),
      onError: () => toast.error('Erro ao remover item'),
    });
  };

  const handleSubmit = (data: Record<string, unknown>) => {
    if (editingItem) {
      updateItem.mutate(data, {
        onSuccess: () => { setShowForm(false); setEditingItem(null); toast.success('Item atualizado'); },
        onError: () => toast.error('Erro ao atualizar item'),
      });
    } else {
      createItem.mutate(data, {
        onSuccess: () => { setShowForm(false); toast.success('Item adicionado à wishlist'); },
        onError: () => toast.error('Erro ao adicionar item'),
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wishlist</h1>
          <p className="text-muted-foreground">Salve voos, hotéis e destinos dos seus sonhos</p>
        </div>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingItem ? 'Editar item' : 'Novo item'}
          </h2>
          <WishlistForm
            item={editingItem || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createItem.isPending || updateItem.isPending}
          />
        </div>
      )}

      <WishlistGrid
        items={wishlistItems}
        filter={filter}
        isLoading={isLoading}
        onFilterChange={setFilter}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
