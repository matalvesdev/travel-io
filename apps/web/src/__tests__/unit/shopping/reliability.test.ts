import { describe, it, expect } from 'vitest';
import {
  calcReliability,
  getReliabilityColor,
  getReliabilityBg,
  STORE_REPUTATION,
  CONDITION_FACTORS,
} from '@/lib/shopping/reliability';

describe('Reliability Module', () => {
  describe('STORE_REPUTATION', () => {
    it('should have scores for all major stores', () => {
      expect(STORE_REPUTATION['Amazon']).toBe(4.7);
      expect(STORE_REPUTATION['Mercado Livre']).toBe(4.5);
      expect(STORE_REPUTATION['Magazine Luiza']).toBe(4.3);
      expect(STORE_REPUTATION['Casas Bahia']).toBe(4.0);
      expect(STORE_REPUTATION['AliExpress']).toBe(3.8);
      expect(STORE_REPUTATION['Shopee']).toBe(3.9);
      expect(STORE_REPUTATION['Netshoes']).toBe(4.2);
    });

    it('should have scores between 0 and 5', () => {
      Object.values(STORE_REPUTATION).forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('CONDITION_FACTORS', () => {
    it('should have factors for all conditions', () => {
      expect(CONDITION_FACTORS['Novo']).toBe(1.0);
      expect(CONDITION_FACTORS['Seminovo']).toBe(0.8);
      expect(CONDITION_FACTORS['Usado']).toBe(0.6);
    });
  });

  describe('calcReliability', () => {
    it('should return high score for reputable store with new product at good price', () => {
      const score = calcReliability('Amazon', 'Novo', 100, 120);
      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return lower score for less reputable store', () => {
      const aliScore = calcReliability('AliExpress', 'Novo', 100, 100);
      const amazonScore = calcReliability('Amazon', 'Novo', 100, 100);
      expect(aliScore).toBeLessThan(amazonScore);
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

    it('should handle zero avgPrice gracefully', () => {
      const score = calcReliability('Amazon', 'Novo', 100, 0);
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
});
