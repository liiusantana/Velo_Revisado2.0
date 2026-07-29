export type OrderStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE';

export function determineOrderStatus(
  score: number,
  entryPercentage: number,
): OrderStatus {
  if (entryPercentage >= 0.5 && score < 700) return 'APROVADO';
  if (score > 700) return 'APROVADO';
  if (score >= 501 && score <= 700) return 'EM_ANALISE';
  return 'REPROVADO';
}
