import { test, expect } from '../support/fixtures'

/**
 * CT02 - Configuração do Veículo (Cores e Rodas) e Cálculo do Preço Base
 *
 * Objetivo: Validar se as escolhas de cores e rodas ("Sport") refletem
 * corretamente no preço final exibido.
 *
 * Pré-condições: Estar na página do Configurador (/configure).
 * Preço base inicial: R$ 40.000,00 (Cor padrão + Rodas "Aero").
 */
test.describe('Configuração do Veículo', () => {
  test.beforeEach(async ({ page, app }) => {
    await page.goto('/configure')
    await app.configurator.ensureBaseState()
  })

  test('deve manter o preço base ao alterar apenas a cor do veículo', async ({ page }) => {
    // Arrange
    await expect(page.getByRole('heading', { name: 'Velô Sprint' })).toBeVisible()

    // Act + Assert — preço inicial
    await expect(page.getByText('R$ 40.000,00', { exact: true })).toBeVisible()

    // Act — cor diferente
    await page.getByRole('button', { name: 'Midnight Black' }).click()

    // Assert — preço inalterado (checkpoint pós-ação)
    await expect(page.getByText('R$ 40.000,00', { exact: true })).toBeVisible()

    const carPreview = page.getByRole('img', { name: /Velô Sprint - midnight-black with aero wheels/i })
    await expect(carPreview).toBeVisible()
    await expect(carPreview).toHaveAttribute('src', '/src/assets/midnight-black-aero-wheels.png')
  })

  test('deve atualizar o preço corretamente ao alterar as rodas', async ({ page }) => {
    // Arrange
    await expect(page.getByRole('heading', { name: 'Velô Sprint' })).toBeVisible()
    await expect(page.getByText('R$ 40.000,00', { exact: true })).toBeVisible()

    // Act — Sport Wheels
    await page.getByRole('button', { name: /Sport Wheels/ }).click()

    // Assert — checkpoint preço + preview
    await expect(page.getByText('R$ 42.000,00', { exact: true })).toBeVisible()
    await expect(page.getByRole('img', { name: /sport/i })).toBeVisible()

    // Act — volta Aero
    await page.getByRole('button', { name: /Aero Wheels/ }).click()

    // Assert — estado final
    await expect(page.getByText('R$ 40.000,00', { exact: true })).toBeVisible()
  })
})

/**
 * CT03 - Configuração do Veículo (Adição de Opcionais) e Cálculo de Preço
 *
 * Objetivo: Validar se a seleção de opcionais ("Precision Park" e "Flux Capacitor")
 * atualiza dinamicamente o preço e se o checkout persiste a configuração.
 *
 * Pré-condições: Configurador com preço base R$ 40.000,00 (sem opcionais, rodas Aero).
 */
test.describe('CT03 - Opcionais e checkout', () => {
  test.beforeEach(async ({ page, app }) => {
    await page.goto('/configure')
    await app.configurator.ensureBaseState()
  })

  test('deve atualizar preço com opcionais, voltar ao base e persistir no pedido', async ({
    page,
    app,
  }) => {
    // Arrange
    const precisionPark = page.getByRole('checkbox', { name: /Precision Park/ })
    const fluxCapacitor = page.getByRole('checkbox', { name: /Flux Capacitor/ })
    await expect(page.getByRole('heading', { name: 'Velô Sprint' })).toBeVisible()
    await expect(precisionPark).toBeVisible()
    await expect(fluxCapacitor).toBeVisible()
    await expect(page.getByText('R$ 40.000,00', { exact: true })).toBeVisible()

    // Act + Assert — Precision Park
    await precisionPark.click()
    await expect(page.getByText('R$ 45.500,00', { exact: true })).toBeVisible()

    // Act + Assert — Flux Capacitor
    await fluxCapacitor.click()
    await expect(page.getByText('R$ 50.500,00', { exact: true })).toBeVisible()

    // Act + Assert — desmarcar ambos
    await precisionPark.click()
    await expect(page.getByText('R$ 45.000,00', { exact: true })).toBeVisible()
    await fluxCapacitor.click()
    await expect(page.getByText('R$ 40.000,00', { exact: true })).toBeVisible()

    // Act — checkout
    await app.configurator.proceedToCheckout()

    // Assert — estado final na página de pedido
    await app.configurator.expectOrderSummaryTotal('R$ 40.000,00')
  })
})
