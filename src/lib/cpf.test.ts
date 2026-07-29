import { describe, it, expect } from 'vitest';
import { cpfDigitsOnly, isValidBrazilianCpf } from './cpf';

describe('cpf', () => {
  it('deve aceitar CPF válido com ou sem máscara', () => {
    const digits = cpfDigitsOnly('529.982.247-25');
    expect(digits).toBe('52998224725');
    expect(isValidBrazilianCpf(digits)).toBe(true);
  });

  it('deve rejeitar CPF com dígitos repetidos', () => {
    expect(isValidBrazilianCpf('11111111111')).toBe(false);
  });
});
