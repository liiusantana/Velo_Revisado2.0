import { expect, type Page } from '@playwright/test'

export type WheelsOption = 'Sport Wheels' | 'Aero Wheels'

export function createConfiguratorActions(page: Page) {
  const elements = {
    headingVeloSprint: page.getByRole('heading', { name: 'Velô Sprint' }),
    colorButton: (name: string) => page.getByRole('button', { name }),
    sportWheels: page.getByRole('button', { name: /Sport Wheels/ }),
    aeroWheels: page.getByRole('button', { name: /Aero Wheels/ }),
    precisionPark: page.getByRole('checkbox', { name: /Precision Park/ }),
    fluxCapacitor: page.getByRole('checkbox', { name: /Flux Capacitor/ }),
    /** CTA do configurador que envia a configuração para a página de pedido (`/order`). */
    monteOSeu: page.getByRole('button', { name: 'Monte o Seu' }),
    previewMidnightBlackAero: page.getByRole('img', {
      name: /Velô Sprint - midnight-black with aero wheels/i,
    }),
  }

  return {
    elements,

    async open(): Promise<void> {
      await page.goto('/configure')
    },

    async openFromHome(): Promise<void> {
      await page.goto('/')
      await page.getByRole('link', { name: /Configure Agora|Configure o Seu/i }).first().click()
    },

    /**
     * Garante rodas Aero, sem opcionais e preço base (checkpoint no estado inicial).
     */
    async ensureBaseState(): Promise<void> {
      await elements.aeroWheels.click()
      if (await elements.precisionPark.isChecked()) await elements.precisionPark.click()
      if (await elements.fluxCapacitor.isChecked()) await elements.fluxCapacitor.click()

      await expect(elements.precisionPark).toBeVisible()
      await expect(elements.fluxCapacitor).toBeVisible()
      await expect(page.getByText('R$ 40.000,00', { exact: true })).toBeVisible()
    },

    /**
     * Avança da tela de configuração para o pedido (rota `/order`).
     */
    async finishConfiguration(): Promise<void> {
      await expect(elements.monteOSeu).toBeVisible()
      await expect(elements.monteOSeu).toBeEnabled()
      await elements.monteOSeu.click()
    },

    async selectColor(colorName: string): Promise<void> {
      await elements.colorButton(colorName).click()
    },

    async selectWheels(wheels: WheelsOption): Promise<void> {
      const button = wheels === 'Sport Wheels' ? elements.sportWheels : elements.aeroWheels
      await button.click()
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
