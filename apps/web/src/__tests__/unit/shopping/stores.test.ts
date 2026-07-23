import { describe, it, expect } from 'vitest';
import { STORES, type StoreId } from '@/lib/shopping/stores';

describe('Stores Module', () => {
  describe('STORES', () => {
    it('should have all 7 stores', () => {
      const storeIds = Object.keys(STORES) as StoreId[];
      expect(storeIds).toHaveLength(7);
    });

    it('should have valid store definitions', () => {
      Object.entries(STORES).forEach(([id, store]) => {
        expect(id).toBeTruthy();
        expect(store.name).toBeTruthy();
        expect(store.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should include Amazon', () => {
      expect(STORES.amazon).toBeDefined();
      expect(STORES.amazon.name).toBe('Amazon');
      expect(STORES.amazon.color).toBe('#FF9900');
    });

    it('should include Mercado Livre', () => {
      expect(STORES.mercadolivre).toBeDefined();
      expect(STORES.mercadolivre.name).toBe('Mercado Livre');
    });

    it('should include Magazine Luiza', () => {
      expect(STORES.magalu).toBeDefined();
      expect(STORES.magalu.name).toBe('Magazine Luiza');
    });

    it('should include Casas Bahia', () => {
      expect(STORES.casasbahia).toBeDefined();
      expect(STORES.casasbahia.name).toBe('Casas Bahia');
    });

    it('should include AliExpress', () => {
      expect(STORES.aliexpress).toBeDefined();
      expect(STORES.aliexpress.name).toBe('AliExpress');
    });

    it('should include Shopee', () => {
      expect(STORES.shopee).toBeDefined();
      expect(STORES.shopee.name).toBe('Shopee');
    });

    it('should include Netshoes', () => {
      expect(STORES.netshoes).toBeDefined();
      expect(STORES.netshoes.name).toBe('Netshoes');
    });
  });
});
