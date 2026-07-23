// Store definitions - no playwright imports
export type StoreId = 'amazon' | 'mercadolivre' | 'magalu' | 'casasbahia' | 'aliexpress' | 'shopee' | 'netshoes';

export const STORES: Record<StoreId, { name: string; color: string }> = {
  amazon: { name: 'Amazon', color: '#FF9900' },
  mercadolivre: { name: 'Mercado Livre', color: '#FFE600' },
  magalu: { name: 'Magazine Luiza', color: '#E41E2C' },
  casasbahia: { name: 'Casas Bahia', color: '#0066CC' },
  aliexpress: { name: 'AliExpress', color: '#E43225' },
  shopee: { name: 'Shopee', color: '#EE4D2D' },
  netshoes: { name: 'Netshoes', color: '#00A859' },
};
