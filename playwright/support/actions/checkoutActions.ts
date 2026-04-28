import { expect, type Page } from '@playwright/test'

/**
 * Ações e elementos da página de checkout / pedido (`/order`).
 * A navegação até aqui parte do configurador (`continueToOrder` em configuratorActions).
 */
export function createCheckoutActions(page: Page) {
  const elements = {
    resumoHeading: page.getByRole('heading', { name: 'Resumo' }),
  }

  return {
    elements,

    async expectSummaryTotal(expected: string): Promise<void> {
      await expect(page).toHaveURL(/\/order/)
      const resumoPanel = elements.resumoHeading.locator('..')
      await expect(resumoPanel.getByText(expected, { exact: true })).toBeVisible()
    },
  }
}
