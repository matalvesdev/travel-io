'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Shield, ExternalLink, ShoppingCart, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { calcReliability, getReliabilityColor, getReliabilityBg, STORE_REPUTATION } from '@/lib/shopping/reliability';

interface ProductDetail {
  id: string;
  name: string;
  store: string;
  price: number;
  originalPrice?: number;
  url?: string;
  imageUrl?: string;
  condition?: string;
  brand?: string;
}

interface ProductDetailPanelProps {
  product: ProductDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToWishlist?: (product: ProductDetail) => void;
}

const CONDITION_BADGES: Record<string, { label: string; color: string }> = {
  'Novo': { label: 'Novo', color: 'bg-success/10 text-success' },
  'Seminovo': { label: 'Seminovo', color: 'bg-amber-500/10 text-amber-500' },
  'Usado': { label: 'Usado', color: 'bg-destructive/10 text-destructive' },
};

const SYNTHETIC_REVIEWS = [
  { rating: 5, text: 'Produto excelente, recomendo!' },
  { rating: 4, text: 'Bom custo-benefício.' },
  { rating: 4, text: 'Entrega rápida e produto como descrito.' },
  { rating: 3, text: 'Produto ok, mas poderia ser melhor.' },
  { rating: 5, text: 'Superou minhas expectativas!' },
];

export function ProductDetailPanel({ product, isOpen, onClose, onAddToWishlist }: ProductDetailPanelProps) {
  if (!product) return null;

  const storeScore = STORE_REPUTATION[product.store] || 3.5;
  const condition = product.condition || 'Novo';
  const avgPrice = product.originalPrice || product.price;
  const reliability = calcReliability(product.store, condition, product.price, avgPrice);
  const reliabilityColor = getReliabilityColor(reliability);
  const reliabilityBg = getReliabilityBg(reliability);
  const conditionBadge = CONDITION_BADGES[condition] || CONDITION_BADGES['Novo'];

  // Generate synthetic reviews based on store reputation
  const reviews = SYNTHETIC_REVIEWS.slice(0, Math.floor(storeScore));
  const avgRating = storeScore;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="relative w-full max-w-lg bg-card border-l shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold">Detalhes do Produto</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-xl"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Product Image */}
              {product.imageUrl && (
                <div className="relative h-48 rounded-xl overflow-hidden bg-muted">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Product Info */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">{product.store}</p>
                <h2 className="text-lg font-bold">{product.name}</h2>
                {product.brand && (
                  <p className="text-sm text-muted-foreground mt-1">Marca: {product.brand}</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Condition Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${conditionBadge.color}`}>
                  {conditionBadge.label}
                </span>
                {product.condition && product.condition !== 'Novo' && (
                  <span className="text-xs text-muted-foreground">
                    Condição: {product.condition}
                  </span>
                )}
              </div>

              {/* Store Reputation */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Reputação da Loja</span>
                    <span className="text-sm font-bold">{storeScore.toFixed(1)}/5.0</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(storeScore / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Baseado em avaliações de clientes
                  </p>
                </CardContent>
              </Card>

              {/* Reliability Score */}
              <Card className={`border-border/50 ${reliabilityBg}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className={`h-5 w-5 ${reliabilityColor}`} />
                      <span className="text-sm font-medium">Pontuação de Confiabilidade</span>
                    </div>
                    <span className={`text-lg font-bold ${reliabilityColor}`}>
                      {reliability}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Baseado em reputação da loja, condição e preço
                  </p>
                </CardContent>
              </Card>

              {/* Synthetic Reviews */}
              <div>
                <h3 className="text-sm font-medium mb-3">Avaliações Sintéticas</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(avgRating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({reviews.length} avaliações)</span>
                </div>

                <div className="space-y-3">
                  {reviews.map((review, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= review.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {onAddToWishlist && (
                  <Button
                    className="w-full"
                    onClick={() => onAddToWishlist(product)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Adicionar à Wishlist
                  </Button>
                )}
                {product.url && (
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a href={product.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver na Loja
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}