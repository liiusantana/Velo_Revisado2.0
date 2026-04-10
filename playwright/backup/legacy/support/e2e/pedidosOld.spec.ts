import { test, expect } from '../../../../support/fixtures'
import { generateOrderCode } from '../../../../support/helpers'
//import { searchOrder } from '../support/helpers'  -> NÃ£o preciso importar novamente pq jÃ¡ tinha uma linha acima fazendo isso, logo passaria a funÃ§Ã£o por virgula.
import { OrderDetails } from '../../../../support/actions/orderLockupActions'

// AAA - Arrange, Act, Assert - PadrÃ£o de teste do playwright (PreparaÃ§Ã£o, AÃ§Ã£o, VerificaÃ§Ã£o)
test.describe('Consultar Pedido', () => {

  /*Para guardar conhecimento: Outros Hooks 
  
  test.beforeAll(async () => {
  console.log('beforeAll: roda uma vez antes de todos os testes')
  })
  
  test.afterEach(async () => {
  console.log('afterEach: roda depois de cada testes')
  })
  
  test.afterAll(async () => {
  console.log('afterAll: roda uma vez depois de todos os testes')
  })
  */

  test.beforeEach(async ({ app }) => {
    console.log('beforeEach: roda antes de cada teste')
    // Arrange
    await app.landing.goto()
    await app.navbar.openOrderLookup()
    await app.orderLockup.validatePageLoaded()
  })

  test('Deve consultar um pedido aprovado', async ({ app, page }) => {

    // Test Data 
    //const order = 'VLO-KSP8V3'
    const order: OrderDetails = {
      number: 'VLO-KSP8V3',
      status: 'APROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Livia Anjos',
        email: 'lsa@hotmail.com'
      },
      payment: 'À Vista'
    }

    //Act antigo (deixei apenas esse como exemplo)
    /* await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number)
    await page.getByRole('button', { name: 'Buscar Pedido' }).click() */

    //Act new (sem page object)
    //await searchOrder(page, order.number)

    //Act PageObject
    await app.orderLockup.searchOrder(order.number)

    //Assert
    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
        - img
        - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)

    const statusBadge = page.getByRole('status').filter({ hasText: order.status })
    await expect(statusBadge).toHaveClass(/bg-green-100/)
    await expect(statusBadge).toHaveClass(/text-green-700/)

    const statusIcon = statusBadge.locator('svg')
    await expect(statusIcon).toHaveClass(/lucide-circle-check-big/)
    /* Para guardar conhecimento: Outras formas de fazer a validaÃ§Ã£o

  - Forma usando Xpath
   const orderCode = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-KSP8V3"]')
   await expect(orderCode).toBeVisible({ timeout: 10_000 })
   await expect(page.getByText('APROVADO')).toBeVisible()
   
   --Usando outra estrategia
   const containerPedido = page.getByRole('paragraph')
   .filter({hasText: /^Pedido$/ })
   .locator('..') //Sobe para o elemento pai (a div que argumenta ambos)
   await expect(containerPedido).toContainText('VLO-KSP8V3', {timeout: 10_000})
   await expect(page.getByText('APROVADO')).toBeVisible()

   */

  })

  test('Deve consultar um pedido reprovado', async ({ app, page }) => {

    // Test Data 
    // const order = 'VLO-R9RU6F'
    const order: OrderDetails = {
      number: 'VLO-R9RU6F',
      status: 'REPROVADO' as const,
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Maria Chiquinha',
        email: 'chiquinha@teste.com.br'
      },
      payment: 'À Vista'
    }

    //Act
    await app.orderLockup.searchOrder(order.number)

    //Assert
    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
        - img
        - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)

    const statusBadge = page.getByRole('status').filter({ hasText: order.status })
    await expect(statusBadge).toHaveClass(/bg-red-100/)
    await expect(statusBadge).toHaveClass(/text-red-700/)

    const statusIcon = statusBadge.locator('svg')
    await expect(statusIcon).toHaveClass(/lucide-circle-x/)

    /* Para guardar conhecimento: Outras formas de fazer a validação

  - Forma usando Xpath
   const orderCode = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-KSP8V3"]')
   await expect(orderCode).toBeVisible({ timeout: 10_000 })
   await expect(page.getByText('APROVADO')).toBeVisible()
   
   --Usando outra estrategia
   const containerPedido = page.getByRole('paragraph')
   .filter({hasText: /^Pedido$/ })
   .locator('..') //Sobe para o elemento pai (a div que argumenta ambos)
   await expect(containerPedido).toContainText('VLO-KSP8V3', {timeout: 10_000})
   await expect(page.getByText('APROVADO')).toBeVisible()

   */

  })

  test('Deve consultar um pedido em análise', async ({ app, page }) => {

    // Test Data 
    // const order = 'VLO-R9RU6F'
    const order: OrderDetails = {
      number: 'VLO-89K26W',
      status: 'EM_ANALISE' as const,
      color: 'Lunar White',
      wheels: 'aero Wheels',
      customer: {
        name: 'Hermione Granger',
        email: 'leviosaaa@teste.com'
      },
      payment: 'À Vista'
    }

    //Act
    await app.orderLockup.searchOrder(order.number)

    //Assert
    await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
        - img
        - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)

      const statusBadge = page.getByRole('status').filter({ hasText: order.status })
      await expect(statusBadge).toHaveClass(/bg-amber-100/)
      await expect(statusBadge).toHaveClass(/text-amber-700/)
  
      const statusIcon = statusBadge.locator('svg')
      await expect(statusIcon).toHaveClass(/lucide-clock/)


  })

  test('Deve exibir mensagem quando o pedido não é encontrado', async ({ app, page }) => {

    // Test Data 
    const order = generateOrderCode()

    //Act
    await app.orderLockup.searchOrder(order)

    //Assert
    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `)
  })

})

