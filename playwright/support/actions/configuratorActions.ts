import { expect, type Page } from '@playwright/test'

export type WheelsOption = 'Sport Wheels' | 'Aero Wheels'

export function createConfiguratorActions(page: Page) {
  return {
    async open(): Promise<void> {
      await page.goto('/configure')
    },

    /**
     * Garante rodas Aero, sem opcionais e preço base (checkpoint no estado inicial).
     */
    async ensureBaseState(): Promise<void> {
      await page.getByRole('button', { name: /Aero Wheels/ }).click()
      const precisionPark = page.getByRole('checkbox', { name: /Precision Park/ })
      const fluxCapacitor = page.getByRole('checkbox', { name: /Flux Capacitor/ })
      if (await precisionPark.isChecked()) await precisionPark.click()
      if (await fluxCapacitor.isChecked()) await fluxCapacitor.click()

      await expect(precisionPark).toBeVisible()
      await expect(fluxCapacitor).toBeVisible()
      await expect(page.getByText('R$ 40.000,00', { exact: true })).toBeVisible()
    },

    async proceedToCheckout(): Promise<void> {
      const checkout = page.getByRole('button', { name: 'Monte o Seu' })
      await expect(checkout).toBeVisible()
      await expect(checkout).toBeEnabled()
      await checkout.click()
    },

    /**
     * Confirma rota de pedido e total no painel Resumo (escopo pelo heading acessível).
     */
    async expectOrderSummaryTotal(expected: string): Promise<void> {
      await expect(page).toHaveURL(/\/order/)
      const resumoPanel = page.getByRole('heading', { name: 'Resumo' }).locator('..')
      await expect(resumoPanel.getByText(expected, { exact: true })).toBeVisible()
    },

    async selectColor(colorName: string): Promise<void> {
      await page.getByRole('button', { name: colorName }).click()
    },

    async selectWheels(wheels: WheelsOption): Promise<void> {
      await page.getByRole('button', { name: new RegExp(wheels) }).click()
    },

    async expectTotalPrice(price: string): Promise<void> {
      const priceLocator = page.getByText(price, { exact: true })
      await expect(priceLocator).toBeVisible()
    },

    async expectCarPreviewSrc(src: string): Promise<void> {
      const preview = page.getByRole('img', { name: /^Velô Sprint - / })
      await expect(preview).toBeVisible()
      await expect(preview).toHaveAttribute('src', src)
    },

    async expectSportPreviewVisible(): Promise<void> {
      await expect(page.getByRole('img', { name: /sport/i })).toBeVisible()
    },
  }
}
