import { describe, it, expect } from 'vitest';
import { determineOrderStatus } from './creditDecision';

describe('determineOrderStatus', () => {
  it('deve aprovar quando score > 700 independente da entrada', () => {
    expect(determineOrderStatus(710, 0)).toBe('APROVADO');
  });

  it('deve reprovar quando score <= 500 e entrada < 50%', () => {
    expect(determineOrderStatus(500, 0.25)).toBe('REPROVADO');
  });
});
