/** Remove tudo que não for dígito (útil para valor mascarado no formulário). */
export function cpfDigitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** CPF brasileiro: 11 dígitos e dígitos verificadores válidos. */
export function isValidBrazilianCpf(digits: string): boolean {
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  let mod = (sum * 10) % 11;
  if (mod === 10 || mod === 11) mod = 0;
  if (mod !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i);
  }
  mod = (sum * 10) % 11;
  if (mod === 10 || mod === 11) mod = 0;
  if (mod !== Number(digits[10])) return false;

  return true;
}
