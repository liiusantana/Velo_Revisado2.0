import { expect, test } from '../support/fixtures'
import { generateOrderCode } from '../support/helpers'
import { OrderDetails } from '../support/actions/orderLockupActions'
import { seedTestOrders, cleanupTestOrders } from '../support/database/orderRepository'
import testData from '../support/fixture/orders.json' with { type: 'json' }

test.describe('Consulta de Pedido', () => {
  test.beforeAll(async () => {
    await seedTestOrders()
  })

  test.beforeEach(async ({ app }) => {
    await app.orderLockup.open()
  })

  test('Deve consultar um pedido aprovado', async ({ app }) => {
    const order = testData.aprovado as OrderDetails

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)

  })

  test('Deve consultar um pedido reprovado', async ({ app }) => {
    const order = testData.reprovado as OrderDetails

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('Deve consultar um pedido em analise', async ({ app }) => {
    const order = testData.emAnalise as OrderDetails

    await app.orderLockup.searchOrder(order.number)
    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('Deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
    const order = generateOrderCode()
    await app.orderLockup.searchOrder(order)
    await app.orderLockup.validateOrderNotFound()
  })

  test('Deve exibir mensagem quando o código do pedido está fora do padrão', async ({ app }) => {
    const orderCode = 'XYZ-999-INVALIDO'
    await app.orderLockup.searchOrder(orderCode)
    await app.orderLockup.validateOrderNotFound()
  })

  test('Deve manter o botão de busca desabilitado com campo vazio ou apenas espaços', async ({ app, page }) => {
    const button = app.orderLockup.elements.searchButton
    await expect(button).toBeDisabled()

    await app.orderLockup.elements.orderInput.fill('        ')
    await expect(button).toBeDisabled()

  })
})