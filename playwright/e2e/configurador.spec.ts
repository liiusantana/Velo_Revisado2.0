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
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
    await app.configurator.ensureBaseState()
  })

  test('deve manter o preço base ao alterar apenas a cor do veículo', async ({ app }) => {
    const { elements, expectTotalPrice, selectColor } = app.configurator

    // Arrange
    await expect(elements.headingVeloSprint).toBeVisible()

    // Act + Assert — preço inicial
    await expectTotalPrice('R$ 40.000,00')

    // Act — cor diferente
    await selectColor('Midnight Black')

    // Assert — preço inalterado (checkpoint pós-ação)
    await expectTotalPrice('R$ 40.000,00')

    await expect(elements.previewMidnightBlackAero).toBeVisible()
    await expect(elements.previewMidnightBlackAero).toHaveAttribute(
      'src',
      '/src/assets/midnight-black-aero-wheels.png',
    )
  })

  test('deve atualizar o preço corretamente ao alterar as rodas', async ({ app }) => {
    const { elements, expectTotalPrice, selectWheels, expectSportPreviewVisible } = app.configurator

    // Arrange
    await expect(elements.headingVeloSprint).toBeVisible()
    await expectTotalPrice('R$ 40.000,00')

    // Act — Sport Wheels
    await selectWheels('Sport Wheels')

    // Assert — checkpoint preço + preview
    await expectTotalPrice('R$ 42.000,00')
    await expectSportPreviewVisible()

    // Act — volta Aero
    await selectWheels('Aero Wheels')

    // Assert — estado final
    await expectTotalPrice('R$ 40.000,00')
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
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
    await app.configurator.ensureBaseState()
  })

  test('deve atualizar preço com opcionais, voltar ao base e persistir no pedido', async ({ app }) => {
    const { elements, expectTotalPrice } = app.configurator

    // Arrange
    await expect(elements.headingVeloSprint).toBeVisible()
    await expect(elements.precisionPark).toBeVisible()
    await expect(elements.fluxCapacitor).toBeVisible()
    await expectTotalPrice('R$ 40.000,00')

    // Act + Assert — Precision Park
    await elements.precisionPark.click()
    await expectTotalPrice('R$ 45.500,00')

    // Act + Assert — Flux Capacitor
    await elements.fluxCapacitor.click()
    await expectTotalPrice('R$ 50.500,00')

    // Act + Assert — desmarcar ambos
    await elements.precisionPark.click()
    await expectTotalPrice('R$ 45.000,00')
    await elements.fluxCapacitor.click()
    await expectTotalPrice('R$ 40.000,00')

    // Act — configurador: enviar configuração para o pedido
    await app.configurator.finishConfiguration()


    // Assert — página de checkout / pedido
    await app.checkout.expectSummaryTotal('R$ 40.000,00')
  })
})
