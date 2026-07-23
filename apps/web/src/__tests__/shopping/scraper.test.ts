import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calcReliability, getReliabilityColor, getReliabilityBg, STORE_REPUTATION } from '@/lib/shopping/reliability';

describe('Reliability Calculation', () => {
  describe('calcReliability', () => {
    it('should return high score for reputable store with new product at good price', () => {
      const score = calcReliability('Amazon', 'Novo', 100, 120);
      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return lower score for less reputable store', () => {
      const score = calcReliability('AliExpress', 'Novo', 100, 100);
      const amazonScore = calcReliability('Amazon', 'Novo', 100, 100);
      expect(score).toBeLessThan(amazonScore);
    });

    it('should return lower score for used product', () => {
      const newScore = calcReliability('Amazon', 'Novo', 100, 100);
      const usedScore = calcReliability('Amazon', 'Usado', 100, 100);
      expect(usedScore).toBeLessThan(newScore);
    });

    it('should return higher score for great deal', () => {
      const goodDealScore = calcReliability('Amazon', 'Novo', 80, 100);
      const regularScore = calcReliability('Amazon', 'Novo', 100, 100);
      expect(goodDealScore).toBeGreaterThan(regularScore);
    });

    it('should return score between 0 and 100', () => {
      const score = calcReliability('Amazon', 'Novo', 100, 100);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle unknown store with default score', () => {
      const score = calcReliability('UnknownStore', 'Novo', 100, 100);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('getReliabilityColor', () => {
    it('should return success color for high score', () => {
      expect(getReliabilityColor(85)).toBe('text-success');
      expect(getReliabilityColor(100)).toBe('text-success');
    });

    it('should return warning color for medium score', () => {
      expect(getReliabilityColor(70)).toBe('text-amber-500');
      expect(getReliabilityColor(60)).toBe('text-amber-500');
    });

    it('should return destructive color for low score', () => {
      expect(getReliabilityColor(50)).toBe('text-destructive');
      expect(getReliabilityColor(0)).toBe('text-destructive');
    });
  });

  describe('getReliabilityBg', () => {
    it('should return success background for high score', () => {
      expect(getReliabilityBg(85)).toBe('bg-success/10');
    });

    it('should return warning background for medium score', () => {
      expect(getReliabilityBg(70)).toBe('bg-amber-500/10');
    });

    it('should return destructive background for low score', () => {
      expect(getReliabilityBg(50)).toBe('bg-destructive/10');
    });
  });

  describe('STORE_REPUTATION', () => {
    it('should have reputation scores for all major stores', () => {
      expect(STORE_REPUTATION['Amazon']).toBeDefined();
      expect(STORE_REPUTATION['Mercado Livre']).toBeDefined();
      expect(STORE_REPUTATION['Magazine Luiza']).toBeDefined();
      expect(STORE_REPUTATION['Casas Bahia']).toBeDefined();
      expect(STORE_REPUTATION['AliExpress']).toBeDefined();
      expect(STORE_REPUTATION['Shopee']).toBeDefined();
      expect(STORE_REPUTATION['Netshoes']).toBeDefined();
    });

    it('should have scores between 0 and 5', () => {
      Object.values(STORE_REPUTATION).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(5);
      });
    });

    it('should have Amazon as highest rated', () => {
      const amazonScore = STORE_REPUTATION['Amazon'];
      Object.values(STORE_REPUTATION).forEach(score => {
        expect(amazonScore).toBeGreaterThanOrEqual(score);
      });
    });
  });
});
