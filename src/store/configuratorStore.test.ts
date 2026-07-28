import { describe, it, expect } from 'vitest';
import { calculateTotalPrice, calculateInstallment, formatPrice, CarConfiguration } from './configuratorStore';

describe('configuratorStore', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate base price correctly with aero wheels and no optionals', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: []
      };
      
      expect(calculateTotalPrice(config)).toBe(40000);
    });

    it('should calculate price correctly with sport wheels', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: []
      };
      
      expect(calculateTotalPrice(config)).toBe(42000);
    });

    it('should calculate price correctly with optionals', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park']
      };
      
      expect(calculateTotalPrice(config)).toBe(45500);
    });

    it('should calculate price correctly with sport wheels and all optionals', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: ['precision-park', 'flux-capacitor']
      };
      
      expect(calculateTotalPrice(config)).toBe(52500);
    });
  });

  describe('calculateInstallment', () => {
    it('should calculate 12x installment with 2% monthly interest correctly', () => {
      const total = 40000;
      expect(calculateInstallment(total)).toBe(3782.38);
    });
  });

  describe('formatPrice', () => {
    it('should format price correctly in BRL', () => {
      const formatted = formatPrice(40000);
      expect(formatted.replace(/\u00A0/g, ' ')).toMatch(/R\$\s?40\.000,00/);
    });
  });
});
